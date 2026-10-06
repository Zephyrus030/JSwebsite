import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  clearPageEdits,
  getEditorId,
  getPageEdits,
  setPageEdit,
} from './editorPersistence';
import styles from './EditorMode.module.css';

const TEXT_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,span,li,a,button';

function selectContents(element) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function pageStoragePath(pathname) {
  return pathname || '/';
}

export default function EditorMode({ children, enabled: enabledProp }) {
  const { pathname } = useLocation();
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(() => (
    enabledProp ?? new URLSearchParams(window.location.search).get('edit') === '1'
  ));
  const [pageEdits, setPageEdits] = useState(() => getPageEdits(pageStoragePath(pathname)));
  const [selected, setSelected] = useState(null);
  const [selectedRect, setSelectedRect] = useState(null);

  useEffect(() => {
    if (enabledProp !== undefined) setEditing(enabledProp);
  }, [enabledProp]);

  useEffect(() => {
    setPageEdits(getPageEdits(pageStoragePath(pathname)));
    setSelected(null);
    setSelectedRect(null);
  }, [pathname]);

  const refreshSelectedRect = useCallback(() => {
    if (!selected?.element?.isConnected) {
      setSelectedRect(null);
      return;
    }
    setSelectedRect(selected.element.getBoundingClientRect());
  }, [selected]);

  const persistEdit = useCallback((id, edit) => {
    const next = { ...(pageEdits[id] || {}), ...edit };
    setPageEdits((current) => ({ ...current, [id]: next }));
    setPageEdit(pageStoragePath(pathname), id, edit);
  }, [pageEdits, pathname]);

  const applyImageEdit = useCallback((element, edit) => {
    if (!element) return;
    if (edit.src) element.src = edit.src;
    if (Number.isFinite(edit.x) || Number.isFinite(edit.y) || Number.isFinite(edit.scale)) {
      const x = Number.isFinite(edit.x) ? edit.x : 0;
      const y = Number.isFinite(edit.y) ? edit.y : 0;
      const scale = Number.isFinite(edit.scale) ? edit.scale : 1;
      element.style.transformOrigin = 'center center';
      element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      element.dataset.editorTransform = 'true';
    }
  }, []);

  useEffect(() => {
    if (!editing || !contentRef.current) return;
    const content = contentRef.current;
    content.querySelectorAll('img').forEach((image) => {
      const id = getEditorId(image, content);
      if (pageEdits[id]) applyImageEdit(image, pageEdits[id]);
    });
    content.querySelectorAll(TEXT_SELECTOR).forEach((element) => {
      const id = getEditorId(element, content);
      const edit = pageEdits[id];
      if (edit?.text != null && document.activeElement !== element) element.textContent = edit.text;
    });
  }, [applyImageEdit, editing, pageEdits]);

  useEffect(() => {
    if (!editing || !contentRef.current) return undefined;
    const content = contentRef.current;
    const onDoubleClick = (event) => {
      const element = event.target.closest(TEXT_SELECTOR);
      if (!element || !content.contains(element)) return;
      event.preventDefault();
      event.stopPropagation();
      element.contentEditable = 'true';
      element.dataset.editorEditing = 'true';
      element.spellcheck = false;
      selectContents(element);
    };
    const onClick = (event) => {
      const image = event.target.closest('img');
      if (image && content.contains(image)) {
        event.preventDefault();
        event.stopPropagation();
        setSelected({ element: image, id: getEditorId(image, content) });
        setSelectedRect(image.getBoundingClientRect());
        return;
      }
      if (!event.target.closest('[data-editor-ui]')) setSelected(null);
    };
    const onBlur = (event) => {
      const element = event.target;
      if (!element.dataset.editorEditing) return;
      persistEdit(getEditorId(element, content), { text: element.textContent || '' });
      element.contentEditable = 'false';
      delete element.dataset.editorEditing;
    };
    const onKeyDown = (event) => {
      if (!event.target.dataset.editorEditing) return;
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        event.target.blur();
      }
    };
    content.addEventListener('dblclick', onDoubleClick, true);
    content.addEventListener('click', onClick, true);
    content.addEventListener('blur', onBlur, true);
    content.addEventListener('keydown', onKeyDown, true);
    return () => {
      content.removeEventListener('dblclick', onDoubleClick, true);
      content.removeEventListener('click', onClick, true);
      content.removeEventListener('blur', onBlur, true);
      content.removeEventListener('keydown', onKeyDown, true);
    };
  }, [editing, persistEdit]);

  useEffect(() => {
    if (!editing) return undefined;
    const onViewportChange = () => refreshSelectedRect();
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [editing, refreshSelectedRect]);

  const updateSelectedImage = (edit) => {
    if (!selected) return;
    const next = { ...(pageEdits[selected.id] || {}), ...edit };
    applyImageEdit(selected.element, next);
    persistEdit(selected.id, edit);
    requestAnimationFrame(refreshSelectedRect);
  };

  const beginImagePointer = (event, mode) => {
    if (!selected) return;
    event.preventDefault();
    event.stopPropagation();
    const initial = pageEdits[selected.id] || {};
    const startX = event.clientX;
    const startY = event.clientY;
    const initialX = initial.x || 0;
    const initialY = initial.y || 0;
    const initialScale = initial.scale || 1;
    const onPointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      if (mode === 'move') {
        updateSelectedImage({ x: initialX + deltaX, y: initialY + deltaY });
        return;
      }
      const diagonalDelta = (deltaX + deltaY) / 2;
      const base = selectedRect?.width || selected.element.getBoundingClientRect().width;
      updateSelectedImage({ scale: Math.max(0.2, initialScale + diagonalDelta / Math.max(base, 1)) });
    };
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  };

  const replaceSelectedImage = (event) => {
    const file = event.target.files?.[0];
    if (!file || !selected) return;
    const reader = new FileReader();
    reader.onload = () => updateSelectedImage({ src: reader.result });
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const exportPageEdits = () => {
    const blob = new Blob([JSON.stringify({ [pageStoragePath(pathname)]: pageEdits }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `page-edits${pathname === '/' ? '-home' : pathname.replaceAll('/', '-')}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exitEditor = () => {
    setEditing(false);
    setSelected(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  };

  return (
    <>
      <div className={`${styles.content} ${editing ? styles.editing : ''}`} data-editor-content ref={contentRef}>{children}</div>
      {editing && (
        <>
          <div aria-label="Page editor" className={styles.toolbar} data-editor-ui role="toolbar">
            <strong>EDIT MODE</strong>
            <span className={styles.status}>{selected ? 'Image selected' : 'Double-click text or select an image'}</span>
            <button disabled={!selected} onClick={() => fileInputRef.current?.click()} type="button">Replace image</button>
            <button onClick={exportPageEdits} type="button">Export</button>
            <button onClick={() => { clearPageEdits(pageStoragePath(pathname)); window.location.reload(); }} type="button">Reset page</button>
            <button onClick={exitEditor} type="button">Exit</button>
            <input accept="image/*" aria-label="Choose replacement image" className={styles.fileInput} data-editor-ui onChange={replaceSelectedImage} ref={fileInputRef} type="file" />
          </div>
          {selected && selectedRect && (
            <div aria-label="Selected image" className={styles.selection} data-editor-ui style={{ height: selectedRect.height, left: selectedRect.left, top: selectedRect.top, width: selectedRect.width }}>
              <button aria-label="Move selected image" className={styles.dragSurface} data-editor-ui onPointerDown={(event) => beginImagePointer(event, 'move')} type="button" />
              <button aria-label="Resize selected image" className={styles.resizeHandle} data-editor-ui onPointerDown={(event) => beginImagePointer(event, 'resize')} type="button" />
            </div>
          )}
        </>
      )}
    </>
  );
}
