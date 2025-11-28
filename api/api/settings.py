from pathlib import Path
import os
import socket
from dotenv import load_dotenv

try:
    import pyodbc
except ImportError:
    pyodbc = None
from corsheaders.defaults import default_headers

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Load environment ---
load_dotenv(BASE_DIR / ".env", override=True)

# ======================================================
# 🌍 ENTORNO Y RED DETECTADOS AUTOMÁTICAMENTE
# ======================================================
DEV = os.getenv("DEV", "True").lower() == "true"  # True = base de pruebas

hostname_ip = socket.gethostbyname(socket.gethostname())
if hostname_ip.startswith("10."):
    NETWORK = "lan"
elif hostname_ip.startswith("172."):
    NETWORK = "zerotier"
else:
    NETWORK = "local"

print(f"🌐 Network: {NETWORK.upper()} | Host IP: {hostname_ip}")
print("💾 Base activa:", "hospitalpruebas" if DEV else "hospitalproduccion")
DB_BACKEND = os.getenv("DB_ENGINE", "mssql").strip().lower()
print(f"🗄️ Motor de base: {DB_BACKEND}")

# ======================================================
# 🔐 SECRET / DEBUG
# ======================================================
SECRET_KEY = os.getenv("SECRET_KEY", "unsafe-dev-key")
DEBUG = True  # puedes dejarlo activo para ver errores

# ======================================================
# ⚙️ CORS / CSRF / HOSTS
# ======================================================
if NETWORK == "lan":
    ALLOWED_HOSTS = [
        "10.10.20.16",
        "localhost",
        "190.148.50.247",
        "192.168.0.25",  # IP LAN actual del servidor
    ]
    CORS_ALLOWED_ORIGINS = [
        "http://10.10.20.16:3000",
        "http://10.10.20.16:3077",
        "http://190.148.50.247:3000",
        "http://192.168.0.6:3000",  # frontend accediendo por IP
    ]

elif NETWORK == "zerotier":
    ALLOWED_HOSTS = [
        "172.25.146.246",
        "localhost",
        "190.148.50.247",
        "192.168.0.25",  # por si accedes igual por IP LAN
    ]
    CORS_ALLOWED_ORIGINS = [
        "http://172.25.146.246:3000",
        "http://172.25.146.246:3077",
        "http://190.148.50.247:3000",
        "http://192.168.0.25:3000",
    ]

else:
    # NETWORK == "local" (tu caso actual: 192.168.0.25)
    ALLOWED_HOSTS = [
        "localhost",
        "127.0.0.1",
        "192.168.0.25",  # 👈 ESTA ES LA CLAVE
        "190.148.50.247",
        "192.168.0.6",
    ]
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.0.6:3000",  # frontend por IP desde otras PCs
        "http://190.148.50.247:3000",
    ]

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = list(default_headers) + ["x-user"]
MSSQL_IDENTIFIERS = {"mssql", "sqlserver", "sql-server"}
MYSQL_IDENTIFIERS = {"mysql", "mariadb", "maria"}

# ======================================================
# 🧾 BASE DE DATOS
# ======================================================

def resolve_odbc_driver() -> str:
    requested = os.getenv("SQL_ODBC_DRIVER")
    available = []

    if pyodbc:
        try:
            available = pyodbc.drivers()
        except pyodbc.Error:
            available = []

    if requested:
        if not available or requested in available:
            return requested
        print(f"⚠️ Driver ODBC solicitado '{requested}' no está instalado, buscando alternativa…")

    for candidate in ("ODBC Driver 18 for SQL Server", "ODBC Driver 17 for SQL Server"):
        if candidate in available:
            print(f"✅ Usando driver ODBC detectado: {candidate}")
            return candidate

    fallback = requested or "ODBC Driver 17 for SQL Server"
    print(f"⚠️ No se encontraron drivers ODBC instalados, usando valor por defecto: {fallback}")
    return fallback


USE_MSSQL = DB_BACKEND in MSSQL_IDENTIFIERS or DB_BACKEND not in (MSSQL_IDENTIFIERS | MYSQL_IDENTIFIERS)
USE_MYSQL = DB_BACKEND in MYSQL_IDENTIFIERS

if DB_BACKEND not in MSSQL_IDENTIFIERS and DB_BACKEND not in MYSQL_IDENTIFIERS:
    print(f"⚠️ Motor '{DB_BACKEND}' no soportado, usando MSSQL por defecto.")

ODBC_DRIVER = resolve_odbc_driver() if USE_MSSQL else None

if DEV:
    DB_NAME = os.getenv("DB_PRUEBAS_NAME")
    DB_USER = os.getenv("DB_PRUEBAS_USER")
    DB_PASS = os.getenv("DB_PRUEBAS_PASSWORD")
    DB_HOST = os.getenv("DB_PRUEBAS_HOST")
    DB_PORT = os.getenv("DB_PRUEBAS_PORT")
else:
    DB_NAME = os.getenv("DB_PROD_NAME")
    DB_USER = os.getenv("DB_PROD_USER")
    DB_PASS = os.getenv("DB_PROD_PASSWORD")
    DB_HOST = os.getenv("DB_PROD_HOST")
    DB_PORT = os.getenv("DB_PROD_PORT")

def build_extra_params() -> str:
    encrypt = os.getenv("SQL_ENCRYPT", "yes").strip().lower() == "yes"
    trust_cert = os.getenv("SQL_TRUST_SERVER_CERT", "yes").strip().lower() == "yes"
    custom = os.getenv("SQL_EXTRA_PARAMS", "").strip().strip(";")

    parts = [
        f"Encrypt={'yes' if encrypt else 'no'}",
        f"TrustServerCertificate={'yes' if trust_cert else 'no'}",
    ]

    if custom:
        parts.append(custom)

    return ";".join(parts) + ";"


def build_db_options():
    if USE_MYSQL:
        return {
            "ENGINE": "django.db.backends.mysql",
            "OPTIONS": {
                "charset": os.getenv("MYSQL_CHARSET", "utf8mb4"),
            },
        }

    return {
        "ENGINE": "mssql",
        "OPTIONS": {
            "driver": ODBC_DRIVER or "ODBC Driver 17 for SQL Server",
            "extra_params": build_extra_params(),
        },
    }


db_engine_options = build_db_options()

DATABASES = {
    "default": {
        "ENGINE": db_engine_options["ENGINE"],
        "NAME": DB_NAME,
        "USER": DB_USER,
        "PASSWORD": DB_PASS,
        "HOST": DB_HOST,
        "PORT": DB_PORT,
        "OPTIONS": db_engine_options.get("OPTIONS", {}),
    }
}

# ======================================================
# 🔧 REST / APPS / MIDDLEWARE
# ======================================================
INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'drf_yasg',
    'api.apps.ApiConfig',
    'django_extensions',
    'operaciones.apps.OperacionesConfig',
    'solicitudes.apps.SolicitudesConfig',
]

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'api.utils.pagination.CustomPageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ]
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'api.middlewares.middlewares.AuditoriaMiddleware',
    'api.middlewares.MovimientoInventarioMiddleware.MovimientoInventarioMiddleware',
]

ROOT_URLCONF = 'api.urls'
WSGI_APPLICATION = 'api.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Guatemala'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'api' / 'static']
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
