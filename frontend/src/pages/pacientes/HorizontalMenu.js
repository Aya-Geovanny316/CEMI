// HorizontalMenu.js
import React from "react";
import { Nav, NavDropdown } from "react-bootstrap";

import "./HorizontalMenu.css";

const deriveKey = (item, path) =>
  item.key ?? item.id ?? item.href ?? `${item.label}-${path.join("-")}`;

const itemHasActiveDescendant = (item, activeKey, path) => {
  if (!item.children) {
    return false;
  }

  return item.children.some((child, index) => {
    const childPath = [...path, index];
    const childKey = deriveKey(child, childPath);
    return (
      childKey === activeKey || itemHasActiveDescendant(child, activeKey, childPath)
    );
  });
};

export default function HorizontalMenu({ items = [], activeKey: controlledKey, onSelect }) {
  const flattenedKeys = React.useMemo(() => {
    const collect = (list, parentPath = []) =>
      list.reduce((acc, item, index) => {
        const path = [...parentPath, index];
        const key = deriveKey(item, path);
        acc.push(key);
        if (item.children) {
          acc.push(...collect(item.children, path));
        }
        return acc;
      }, []);

    return collect(items, []);
  }, [items]);

  const firstKey = flattenedKeys[0] ?? null;

  const [internalKey, setInternalKey] = React.useState(controlledKey ?? firstKey);

  React.useEffect(() => {
    if (controlledKey !== undefined) {
      setInternalKey(controlledKey);
    }
  }, [controlledKey]);

  React.useEffect(() => {
    if (controlledKey === undefined && !flattenedKeys.includes(internalKey)) {
      setInternalKey(firstKey);
    }
  }, [controlledKey, flattenedKeys, internalKey, firstKey]);

  const handleSelect = React.useCallback(
    (key, item, event) => {
      if (controlledKey === undefined) {
        setInternalKey(key);
      }
      if (onSelect) {
        onSelect(key, item, event);
      }
    },
    [controlledKey, onSelect]
  );

  const currentKey = controlledKey ?? internalKey;

  return (
    <Nav className="horizontal-menu nav-tabs" variant="tabs">
      {items.map((item, index) => {
        const path = [index];
        const itemKey = deriveKey(item, path);
        return (
          <MenuItem
            key={itemKey}
            item={item}
            itemKey={itemKey}
            activeKey={currentKey}
            onSelect={handleSelect}
            path={path}
          />
        );
      })}
    </Nav>
  );
}

function MenuItem({ item, itemKey, activeKey, onSelect, path }) {
  if (item.children && item.children.length > 0) {
    const hasActiveChild = itemHasActiveDescendant(item, activeKey, path);
    const isActive = hasActiveChild || itemKey === activeKey;

    const dropdownProps = path.length > 1 ? { drop: "right" } : {};

    return (
      <NavDropdown
        title={item.label}
        id={`dropdown-${path.join("-")}`}
        className={isActive ? "active" : undefined}
        menuVariant="dark"
        {...dropdownProps}
      >
        {item.children.map((child, index) => {
          const childPath = [...path, index];
          const childKey = deriveKey(child, childPath);
          return (
            <MenuItem
              key={childKey}
              item={child}
              itemKey={childKey}
              activeKey={activeKey}
              onSelect={onSelect}
              path={childPath}
            />
          );
        })}
      </NavDropdown>
    );
  }

  const handleClick = (event) => {
    if (!item.href) {
      event.preventDefault();
    }
    onSelect(itemKey, item, event);
    if (typeof item.onClick === "function") {
      item.onClick(item, event);
    }
  };

  if (path.length > 1) {
    return (
      <NavDropdown.Item
        href={item.href}
        active={itemKey === activeKey}
        onClick={handleClick}
      >
        {item.label}
      </NavDropdown.Item>
    );
  }

  return (
    <Nav.Item>
      <Nav.Link href={item.href} active={itemKey === activeKey} onClick={handleClick}>
        {item.label}
      </Nav.Link>
    </Nav.Item>
  );
}
