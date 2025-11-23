import io
import re
import unicodedata
import zipfile
from collections import defaultdict
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from xml.etree import ElementTree as ET

from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from api.utils.pagination import CustomPageNumberPagination
from ..models.cargaMasivaModel import (
    CargaMasivaExistencia,
    CargaMasivaExistenciaItem,
    CargaMasivaPrecio,
    CargaMasivaPrecioItem,
    CargaMasivaAdmision,
    CargaMasivaAdmisionItem,
)
from ..models.inventariosSkuModel import InventarioSKU, BodegaSKU
from ..models.inventarioPrecioSkuModel import PrecioSKU
from ..models.admisionesModel import (
    Admision,
    Paciente,
    Responsable,
    Esposo,
    DatosLaborales,
    DatosSeguro,
    GarantiaPago,
)
from ..serializers.cargaMasivaSerializer import (
    CargaMasivaExistenciaSerializer,
    CargaMasivaPrecioSerializer,
    CargaMasivaAdmisionSerializer,
    CargaMasivaAdmisionDetalleSerializer,
)
from ..serializers.admisionesSerializer import AdmisionCreateSerializer


def _resolve_username(request):
    user = getattr(request, 'user', None)
    if user and getattr(user, 'is_authenticated', False):
        return user.username
    return request.headers.get('X-User') or None


def _column_index(col_letters: str) -> int:
    result = 0
    for ch in col_letters.upper():
        if 'A' <= ch <= 'Z':
            result = result * 26 + (ord(ch) - ord('A') + 1)
    return max(result - 1, 0)


def _normalize_header_value(value) -> str:
    text = str(value or '').strip().lower()
    if not text:
        return ''
    normalized = unicodedata.normalize('NFKD', text)
    return ''.join(ch for ch in normalized if not unicodedata.combining(ch))


def _header_token(value) -> str:
    normalized = _normalize_header_value(value)
    return re.sub(r'[^a-z0-9]', '', normalized)


def _load_excel_rows(file_obj):
    try:
        file_obj.seek(0)
    except Exception:
        pass

    data = file_obj.read()
    if not data:
        return []

    try:
        zip_buffer = io.BytesIO(data)
        workbook = zipfile.ZipFile(zip_buffer)
    finally:
        try:
            file_obj.seek(0)
        except Exception:
            pass

    ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

    shared_strings = []
    if 'xl/sharedStrings.xml' in workbook.namelist():
        ss_tree = ET.fromstring(workbook.read('xl/sharedStrings.xml'))
        for si in ss_tree.findall('main:si', ns):
            text_parts = [t.text or '' for t in si.findall('.//main:t', ns)]
            shared_strings.append(''.join(text_parts))

    sheet_name = 'xl/worksheets/sheet1.xml'
    if sheet_name not in workbook.namelist():
        candidates = [name for name in workbook.namelist() if name.startswith('xl/worksheets/sheet')]
        if not candidates:
            return []
        sheet_name = candidates[0]

    sheet_tree = ET.fromstring(workbook.read(sheet_name))
    rows = []

    for row in sheet_tree.findall('.//main:row', ns):
        row_map = {}
        max_index = 0
        for cell in row.findall('main:c', ns):
            ref = cell.attrib.get('r', 'A1')
            col_letters = re.sub(r'[^A-Z]', '', ref.upper()) or 'A'
            col_index = _column_index(col_letters)
            max_index = max(max_index, col_index)

            cell_type = cell.attrib.get('t')
            value_node = cell.find('main:v', ns)
            value = ''
            if cell_type == 's':
                if value_node is not None and value_node.text is not None:
                    idx = int(value_node.text)
                    if 0 <= idx < len(shared_strings):
                        value = shared_strings[idx]
            else:
                if value_node is not None and value_node.text is not None:
                    value = value_node.text

            row_map[col_index] = value

        if row_map:
            row_values = [row_map.get(i, '') for i in range(max_index + 1)]
        else:
            row_values = ['']
        rows.append(row_values)

    return rows


def _open_zip_file(file_obj):
    try:
        return zipfile.ZipFile(file_obj)
    except Exception:
        pass

    # Si falla, reintentar leyendo a memoria
    try:
        file_obj.seek(0)
    except Exception:
        pass

    data = file_obj.read()
    try:
        file_obj.seek(0)
    except Exception:
        pass
    return zipfile.ZipFile(io.BytesIO(data))


def _stream_excel_rows(file_obj):
    """
    Itera filas de Excel (.xlsx) en modo streaming para archivos grandes.
    """
    workbook = _open_zip_file(file_obj)
    ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

    shared_strings = []
    if 'xl/sharedStrings.xml' in workbook.namelist():
        ss_tree = ET.fromstring(workbook.read('xl/sharedStrings.xml'))
        for si in ss_tree.findall('main:si', ns):
            text_parts = [t.text or '' for t in si.findall('.//main:t', ns)]
            shared_strings.append(''.join(text_parts))

    sheet_name = 'xl/worksheets/sheet1.xml'
    if sheet_name not in workbook.namelist():
        candidates = [name for name in workbook.namelist() if name.startswith('xl/worksheets/sheet')]
        if not candidates:
            return
        sheet_name = candidates[0]

    with workbook.open(sheet_name) as sheet_file:
        context = ET.iterparse(sheet_file, events=('end',))
        for event, elem in context:
            if elem.tag.endswith('row'):
                row_map = {}
                max_index = 0
                for cell in elem.findall('main:c', ns):
                    ref = cell.attrib.get('r', 'A1')
                    col_letters = re.sub(r'[^A-Z]', '', ref.upper()) or 'A'
                    col_index = _column_index(col_letters)
                    max_index = max(max_index, col_index)

                    cell_type = cell.attrib.get('t')
                    value_node = cell.find('main:v', ns)
                    value = ''
                    if cell_type == 's':
                        if value_node is not None and value_node.text is not None:
                            idx = int(value_node.text)
                            if 0 <= idx < len(shared_strings):
                                value = shared_strings[idx]
                    else:
                        if value_node is not None and value_node.text is not None:
                            value = value_node.text

                    row_map[col_index] = value

                if row_map:
                    yield [row_map.get(i, '') for i in range(max_index + 1)]
                else:
                    yield ['']
                elem.clear()


def _validate_skus(codes):
    existing = set(
        InventarioSKU.objects.filter(codigo_sku__in=codes)
        .values_list('codigo_sku', flat=True)
    )
    missing = [code for code in codes if code not in existing]
    return missing


def _parse_excel_date(value):
    if value in (None, ''):
        return None
    try:
        number = float(value)
        if number > 0:
            base = datetime(1899, 12, 30)
            return (base + timedelta(days=number)).date()
    except Exception:
        pass

    text_value = str(value).strip()
    for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%m/%d/%Y'):
        try:
            return datetime.strptime(text_value, fmt).date()
        except Exception:
            continue

    try:
        return datetime.fromisoformat(text_value).date()
    except Exception:
        return None


@api_view(['GET'])
def listar_cargas_existencias(request):
    qs = CargaMasivaExistencia.objects.all().order_by('-created_at')
    paginator = CustomPageNumberPagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = CargaMasivaExistenciaSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
def detalle_carga_existencias(request, pk):
    try:
        carga = CargaMasivaExistencia.objects.get(pk=pk)
    except CargaMasivaExistencia.DoesNotExist:
        return Response({'error': 'Carga no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    serializer = CargaMasivaExistenciaSerializer(carga)
    return Response(serializer.data)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@transaction.atomic
def crear_carga_existencias(request):
    bodega = request.data.get('bodega')
    archivo = request.FILES.get('archivo')

    if not bodega:
        return Response({'error': 'Debe seleccionar una bodega'}, status=status.HTTP_400_BAD_REQUEST)
    if not archivo:
        return Response({'error': 'Debe adjuntar un archivo de Excel (.xlsx)'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        rows = _load_excel_rows(archivo)
    except Exception as exc:
        return Response({'error': f'No fue posible leer el archivo: {exc}'}, status=status.HTTP_400_BAD_REQUEST)

    if len(rows) <= 1:
        return Response({'error': 'El archivo no contiene registros para procesar'}, status=status.HTTP_400_BAD_REQUEST)

    header_tokens = [_header_token(cell) for cell in rows[0]] if rows else []
    sku_aliases = {'sku', 'codigosku', 'codigo'}
    cantidad_aliases = {
        'cantidad',
        'cantidadtotal',
        'cantidaddisponible',
        'cantidades',
        'existencia',
        'existencias',
        'qty',
        'cantidadfinal',
    }

    sku_idx = next((i for i, token in enumerate(header_tokens) if token in sku_aliases), None)
    cantidad_idx = next((i for i, token in enumerate(header_tokens) if token in cantidad_aliases), None)

    if sku_idx is None:
        sku_idx = 0
    if cantidad_idx is None:
        cantidad_idx = 1

    acumulado = defaultdict(int)
    for idx, row in enumerate(rows[1:], start=2):
        row = list(row)
        sku_raw = row[sku_idx] if sku_idx < len(row) else ''
        cantidad_raw = row[cantidad_idx] if cantidad_idx < len(row) else ''
        sku_code = str(sku_raw).strip() if sku_raw else ''
        if not sku_code:
            continue
        try:
            cantidad_dec = Decimal(str(cantidad_raw or 0))
            if cantidad_dec < 0:
                return Response({'error': f'La cantidad no puede ser negativa (fila {idx}, SKU {sku_code})'}, status=status.HTTP_400_BAD_REQUEST)
            cantidad = int(cantidad_dec.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
        except Exception:
            return Response({'error': f'Cantidad inválida en la fila {idx} para el SKU {sku_code}'}, status=status.HTTP_400_BAD_REQUEST)
        if cantidad == 0:
            continue
        acumulado[sku_code] += cantidad

    if not acumulado:
        return Response({'error': 'No hay cantidades válidas para cargar'}, status=status.HTTP_400_BAD_REQUEST)

    missing = _validate_skus(list(acumulado.keys()))
    if missing:
        return Response({'error': 'Existen SKU que no están registrados', 'skus': missing}, status=status.HTTP_400_BAD_REQUEST)

    username = _resolve_username(request)
    carga = CargaMasivaExistencia.objects.create(
        bodega=bodega,
        usuario=username,
        archivo_nombre=getattr(archivo, 'name', None),
    )

    sku_objs = {s.codigo_sku: s for s in InventarioSKU.objects.filter(codigo_sku__in=acumulado.keys())}

    for sku_code, cantidad in acumulado.items():
        sku_obj = sku_objs.get(sku_code)
        bodega_sku, _ = BodegaSKU.objects.select_for_update().get_or_create(
            sku=sku_obj,
            nombre_bodega=bodega,
            defaults={'cantidad': 0},
        )
        cantidad_anterior = int(bodega_sku.cantidad or 0)
        bodega_sku.cantidad = cantidad_anterior + int(cantidad)
        bodega_sku.save()

        CargaMasivaExistenciaItem.objects.create(
            carga=carga,
            sku=sku_code,
            descripcion=sku_obj.nombre,
            cantidad_cargada=int(cantidad),
            cantidad_anterior=cantidad_anterior,
            cantidad_resultante=int(bodega_sku.cantidad),
        )

    serializer = CargaMasivaExistenciaSerializer(carga)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def listar_cargas_precios(request):
    qs = CargaMasivaPrecio.objects.all().order_by('-created_at')
    paginator = CustomPageNumberPagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = CargaMasivaPrecioSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
def detalle_carga_precios(request, pk):
    try:
        carga = CargaMasivaPrecio.objects.get(pk=pk)
    except CargaMasivaPrecio.DoesNotExist:
        return Response({'error': 'Carga no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    serializer = CargaMasivaPrecioSerializer(carga)
    return Response(serializer.data)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@transaction.atomic
def crear_carga_precios(request):
    seguro = request.data.get('seguro')
    archivo = request.FILES.get('archivo')

    if not seguro:
        return Response({'error': 'Debe seleccionar un seguro'}, status=status.HTTP_400_BAD_REQUEST)
    if not archivo:
        return Response({'error': 'Debe adjuntar un archivo de Excel (.xlsx)'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        rows = _load_excel_rows(archivo)
    except Exception as exc:
        return Response({'error': f'No fue posible leer el archivo: {exc}'}, status=status.HTTP_400_BAD_REQUEST)

    if len(rows) <= 1:
        return Response({'error': 'El archivo no contiene registros para procesar'}, status=status.HTTP_400_BAD_REQUEST)

    novedades = {}
    for idx, row in enumerate(rows[1:], start=2):
        row = list(row)
        if len(row) < 2:
            row += [None] * (2 - len(row))
        sku_raw, precio_raw = row[:2]
        sku_code = str(sku_raw).strip() if sku_raw else ''
        if not sku_code:
            continue
        try:
            precio = Decimal(str(precio_raw)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        except Exception:
            return Response({'error': f'Precio inválido en la fila {idx} para el SKU {sku_code}'}, status=status.HTTP_400_BAD_REQUEST)
        if precio < 0:
            return Response({'error': f'El precio no puede ser negativo (fila {idx}, SKU {sku_code})'}, status=status.HTTP_400_BAD_REQUEST)
        novedades[sku_code] = precio

    if not novedades:
        return Response({'error': 'No hay precios válidos para procesar'}, status=status.HTTP_400_BAD_REQUEST)

    missing = _validate_skus(list(novedades.keys()))
    if missing:
        return Response({'error': 'Existen SKU que no están registrados', 'skus': missing}, status=status.HTTP_400_BAD_REQUEST)

    username = _resolve_username(request)
    carga = CargaMasivaPrecio.objects.create(
        seguro=seguro,
        usuario=username,
        archivo_nombre=getattr(archivo, 'name', None),
    )

    sku_objs = {s.codigo_sku: s for s in InventarioSKU.objects.filter(codigo_sku__in=novedades.keys())}

    for sku_code, precio in novedades.items():
        sku_obj = sku_objs.get(sku_code)
        precio_qs = PrecioSKU.objects.select_for_update().filter(
            sku=sku_obj,
            seguro_nombre__iexact=seguro,
            is_active=True,
        ).order_by('-vigente_desde')
        precio_prev = precio_qs.first()
        if precio_prev:
            precio_anterior = precio_prev.precio
            precio_prev.precio = precio
            precio_prev.sku_nombre = sku_obj.nombre
            precio_prev.save(update_fields=['precio', 'sku_nombre'])
            precio_final = precio_prev.precio
        else:
            precio_prev = PrecioSKU.objects.create(
                sku=sku_obj,
                sku_nombre=sku_obj.nombre,
                seguro_nombre=seguro,
                precio=precio,
            )
            precio_anterior = Decimal('0.00')
            precio_final = precio_prev.precio

        CargaMasivaPrecioItem.objects.create(
            carga=carga,
            sku=sku_code,
            descripcion=sku_obj.nombre,
            precio_anterior=precio_anterior,
            precio_nuevo=precio_final,
        )

    serializer = CargaMasivaPrecioSerializer(carga)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def listar_cargas_admisiones(request):
    qs = CargaMasivaAdmision.objects.all().order_by('-created_at')
    paginator = CustomPageNumberPagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = CargaMasivaAdmisionSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
def detalle_carga_admisiones(request, pk):
    try:
        carga = CargaMasivaAdmision.objects.get(pk=pk)
    except CargaMasivaAdmision.DoesNotExist:
        return Response({'error': 'Carga no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    serializer = CargaMasivaAdmisionDetalleSerializer(carga)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser])
def crear_carga_admisiones(request):
    if request.method == 'GET':
        return Response(
            {'detail': 'Use POST con un archivo .xlsx en el campo "archivo" para procesar la carga.'},
            status=status.HTTP_200_OK,
        )
    archivo = request.FILES.get('archivo')
    username = _resolve_username(request)
    try:
        chunk_size = int(request.query_params.get('chunk_size') or request.data.get('chunk_size') or 300)
    except Exception:
        chunk_size = 300
    chunk_size = max(50, min(chunk_size, 1000))

    if not archivo:
        return Response({'error': 'Debe adjuntar un archivo de Excel (.xlsx)'}, status=status.HTTP_400_BAD_REQUEST)

    archivo_nombre = getattr(archivo, 'name', None)
    archivo_fuente = 'upload'

    try:
        row_iter = _stream_excel_rows(archivo)
        if row_iter is None:
            return Response({'error': 'El archivo no contiene registros para procesar'}, status=status.HTTP_400_BAD_REQUEST)
        rows_generator = iter(row_iter)
        header_row = next(rows_generator, None)
        if not header_row:
            return Response({'error': 'El archivo no contiene registros para procesar'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        return Response({'error': f'No fue posible leer el archivo: {exc}'}, status=status.HTTP_400_BAD_REQUEST)

    header_tokens = [_header_token(cell) for cell in header_row] if header_row else []

    def find_index(aliases, default=None):
        for i, token in enumerate(header_tokens):
            if token in aliases:
                return i
        return default

    exp_idx = find_index({'nodeexpediente', 'noexpediente', 'expediente'}, 0)
    nombre_idx = find_index({'nombrecompleto', 'nombre', 'paciente'}, 1)
    tel_idx = find_index({'telefono', 'tel'}, 2)
    tel2_idx = find_index({'telefonosec', 'telefonosecundario', 'telefonodos'}, 3)
    depto_idx = find_index({'departamento', 'depto'}, 4)
    muni_idx = find_index({'municipio', 'muni'}, 5)
    ref_idx = find_index({'referencia', 'direccion'}, 6)
    fecha_idx = find_index({'fechanacimiento', 'nacimiento', 'fnacimiento'}, 7)
    edad_idx = find_index({'anosdeedad', 'edad'}, 8)
    contacto_idx = find_index({'contactodeemergencia', 'contactoemergencia', 'contacto'}, 9)
    dpi_idx = find_index({'nodpi', 'dpi', 'documento'}, 10)

    carga = CargaMasivaAdmision.objects.create(
        usuario=username,
        archivo_nombre=archivo_nombre,
        archivo_fuente=archivo_fuente,
    )

    items_to_create = []
    creados = 0
    omitidos = 0
    errores = 0

    existing_ids = set(Admision.objects.values_list('id', flat=True))
    seen_new_ids = set()
    next_auto_id = max(max(existing_ids, default=6999), 6999) + 1

    def flush_items():
        nonlocal items_to_create
        if items_to_create:
            CargaMasivaAdmisionItem.objects.bulk_create(items_to_create, batch_size=chunk_size)
            items_to_create = []

    for idx, row in enumerate(rows_generator, start=2):
        try:
            row = list(row)
            expediente_raw = (row[exp_idx] if exp_idx is not None and exp_idx < len(row) else '') or ''
            expediente_str = str(expediente_raw).strip()
            expediente_id = None
            if expediente_str:
                try:
                    expediente_id = int(Decimal(expediente_str).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
                except Exception:
                    expediente_id = None

            nombre = (row[nombre_idx] if nombre_idx is not None and nombre_idx < len(row) else '') or ''
            nombre = str(nombre).strip()
            if not nombre:
                raise ValueError(f'Fila {idx}: el nombre del paciente es requerido')

            telefono = (row[tel_idx] if tel_idx is not None and tel_idx < len(row) else '') or ''
            telefono = str(telefono).strip()
            telefono_secundario = (row[tel2_idx] if tel2_idx is not None and tel2_idx < len(row) else '') or ''
            telefono_secundario = str(telefono_secundario).strip()
            departamento = (row[depto_idx] if depto_idx is not None and depto_idx < len(row) else '') or ''
            departamento = str(departamento).strip()
            municipio = (row[muni_idx] if muni_idx is not None and muni_idx < len(row) else '') or ''
            municipio = str(municipio).strip()
            referencia = (row[ref_idx] if ref_idx is not None and ref_idx < len(row) else '') or ''
            referencia = str(referencia).strip()
            fecha_nacimiento_raw = row[fecha_idx] if fecha_idx is not None and fecha_idx < len(row) else None
            fecha_nacimiento = _parse_excel_date(fecha_nacimiento_raw)
            edad_raw = row[edad_idx] if edad_idx is not None and edad_idx < len(row) else None
            contacto_emergencia = (row[contacto_idx] if contacto_idx is not None and contacto_idx < len(row) else '') or ''
            contacto_emergencia = str(contacto_emergencia).strip()
            dpi = (row[dpi_idx] if dpi_idx is not None and dpi_idx < len(row) else '') or ''
            dpi = str(dpi).strip()
            edad_anios = None
            if edad_raw not in (None, ''):
                try:
                    edad_anios = int(Decimal(str(edad_raw)).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
                except Exception:
                    edad_anios = None
            if edad_anios is None and fecha_nacimiento:
                try:
                    today = datetime.today().date()
                    edad_anios = today.year - fecha_nacimiento.year - ((today.month, today.day) < (fecha_nacimiento.month, fecha_nacimiento.day))
                except Exception:
                    edad_anios = None

            if expediente_id and (expediente_id in existing_ids or expediente_id in seen_new_ids):
                omitidos += 1
                items_to_create.append(CargaMasivaAdmisionItem(
                    carga=carga,
                    expediente=expediente_str,
                    nombre=nombre,
                    telefono=telefono,
                    telefono_secundario=telefono_secundario,
                    departamento=departamento,
                    municipio=municipio,
                    referencia=referencia,
                    contacto_emergencia=contacto_emergencia,
                    dpi=dpi,
                    estado='omitido',
                    mensaje='Ya existe una admisión con este número de expediente',
                ))
                continue

            admision_id = expediente_id
            if admision_id is None:
                admision_id = max(next_auto_id, 7000)
                next_auto_id = admision_id + 1

            seen_new_ids.add(admision_id)

            direccion = ", ".join(filter(None, [departamento, municipio]))
            if referencia:
                direccion = ", ".join(filter(None, [direccion, referencia]))

            primer_nombre, segundo_nombre, primer_apellido, segundo_apellido = AdmisionCreateSerializer._split_name(nombre)
            resp_primero, resp_segundo, resp_apellido, resp_apellido2 = AdmisionCreateSerializer._split_name(contacto_emergencia or '')

            paciente = Paciente.objects.create(
                primer_nombre=primer_nombre or nombre or 'Paciente',
                segundo_nombre=segundo_nombre or None,
                primer_apellido=primer_apellido or None,
                segundo_apellido=segundo_apellido or None,
                genero=None,
                estado_civil=None,
                fecha_nacimiento=fecha_nacimiento,
                edad=edad_anios,
                tipo_identificacion='DPI' if dpi else None,
                numero_identificacion=dpi or None,
                telefono=telefono or telefono_secundario or None,
                direccion=direccion or None,
                departamento=departamento or None,
                municipio=municipio or None,
                referencia=referencia or None,
                telefono1=telefono or None,
                telefono2=telefono_secundario or None,
                correo=None,
                observacion=referencia or None,
                religion=None,
                nit=None,
                nombre_factura=nombre or None,
                direccion_factura=direccion or None,
                correo_factura=None,
                tipo_sangre=None,
                contacto_emergencia=contacto_emergencia or None,
            )

            responsable = Responsable.objects.create(
                primer_nombre=resp_primero or primer_nombre or 'Responsable',
                segundo_nombre=resp_segundo or None,
                primer_apellido=resp_apellido or primer_apellido or None,
                segundo_apellido=resp_apellido2 or segundo_apellido or None,
                telefono1=telefono or telefono_secundario or None,
                telefono2=None,
                contacto=contacto_emergencia or nombre,
            )

            admision = Admision.objects.create(
                id=admision_id,
                paciente=paciente,
                responsable=responsable,
                esposo=None,
                datos_laborales=None,
                datos_seguro=None,
                garantia_pago=None,
                area_admision='Histórico',
                habitacion=None,
                medico_tratante=None,
                estado='ingresado',
            )

            creados += 1
            items_to_create.append(CargaMasivaAdmisionItem(
                carga=carga,
                expediente=expediente_str or str(admision_id),
                nombre=nombre,
                telefono=telefono,
                telefono_secundario=telefono_secundario,
                departamento=departamento,
                municipio=municipio,
                referencia=referencia,
                contacto_emergencia=contacto_emergencia,
                dpi=dpi,
                estado='creado',
                mensaje='Registro creado correctamente',
                admision_id=admision.id,
                paciente_id=paciente.id,
            ))
            if len(items_to_create) >= chunk_size:
                flush_items()
        except Exception as exc:
            errores += 1
            items_to_create.append(CargaMasivaAdmisionItem(
                carga=carga,
                expediente=str(expediente_raw or '') if 'expediente_raw' in locals() else None,
                nombre=nombre if 'nombre' in locals() else None,
                estado='error',
                mensaje=f'Error en la fila {idx}: {exc}',
            ))
            continue

    flush_items()

    carga.total_creados = creados
    carga.total_omitidos = omitidos
    carga.total_errores = errores
    carga.save(update_fields=['total_creados', 'total_omitidos', 'total_errores'])

    serializer = CargaMasivaAdmisionDetalleSerializer(carga)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
