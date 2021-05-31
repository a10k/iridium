import { html } from 'htm/preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Runtime } from '@observablehq/runtime';
import {
  Interpreter,
  Compiler,
} from '@alex.garcia/unofficial-observablehq-compiler';
import IridiumCell from './IridiumCell.js';

const iridiumImportResolver = (path) => {
  if (path.indexOf('/') > -1 || true) {
    return fetch(path)
      .then((res) => res.text())
      .then((js) => {
        const blob = new Blob([js], {
          type: 'text/javascript',
        });
        const objectURL = URL.createObjectURL(blob);
        return objectURL;
      })
      .then((u) => import(u))
      .then((m) => m.default);
  }
};

const IridiumNotebook = (props) => {
  const ref = useRef(null);
  const [runtime, _runtime] = useState(new Runtime());
  const [main, _main] = useState(runtime.module());
  const [interpreter, _interpreter] = useState(
    new Interpreter({
      module: main,
      resolveImportPath: iridiumImportResolver,
    }),
  );
  const [cells, _cells] = useState(props.cells);
  const [id, _id] = useState(
    Math.max.apply(
      Math,
      [0, ...props.cells].map((d) => d.id || 0),
    ) + 1,
  );

  const _onDelete = (r_id) => {
    _cells(cells.filter((d) => d.id !== r_id));
  };
  const _onPinToggle = (r_id) => {
    _cells(
      cells.map((d) => {
        if (d.id == r_id) {
          d.pin = !d.pin;
        }
        return d;
      }),
    );
  };
  const _onNew = () => {
    _id(id + 1);
    return _cells([
      ...cells,
      { id: id + 1, pin: true, sourceCode: '/* New Cell! */' },
    ]);
  };
  const _onNewBefore = (index) => {
    _id(id + 1);
    cells.splice(index, 0, {
      id: id + 1,
      pin: true,
      sourceCode: '/* New Cell! */',
    });
    return _cells(cells);
  };
  const _onUpdate = (r_id) => {
    return (sourceCode) =>
      _cells(
        cells.map((cell) =>
          cell.id === r_id ? Object.assign(cell, { sourceCode }) : cell,
        ),
      );
  };
  const onKeyPressForSave = (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 's' || event.key === 'S')
    ) {
      //ctrl/cmd+s
      props.onSave(cells);
      event.preventDefault();
    }
  };

  useEffect(() => {
    main.define('width', ['Generators'], (Generators) =>
      Generators.observe((change) => {
        change(null);
        const ro = new ResizeObserver((entries) => {
          for (let entry of entries) {
            change(entry.contentRect.width);
          }
        });
        ro.observe(ref.current);
        return () => ro.disconnect();
      }),
    );
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', onKeyPressForSave);
    return () => {
      document.removeEventListener('keydown', onKeyPressForSave);
    };
  }, [cells]);

  return html`<div class="IridiumNotebook" ref=${ref}>
    <div class="IridiumHeader">
      <div class="IridiumTitle">../${props.title || ''}</div>
      <sl-button-group style="float:right;">
        <sl-button onClick=${() => props.onSave(cells)}
          ><sl-icon name="journal-arrow-up"></sl-icon
        ></sl-button>
        ${props.list && props.list.length
          ? html`<sl-dropdown hoist placement="bottom-end">
              <sl-button slot="trigger" caret></sl-button
              ><sl-menu class="IridiumList">
                ${props.list.map((item) => {
                  return html`<sl-menu-item
                    checked=${item == props.title}
                    onClick=${() => {
                      if (item != props.title) {
                        props._cells(null);
                        props._current(item);
                      }
                    }}
                  >
                    ${item}
                  </sl-menu-item>`;
                })}
              </sl-menu>
            </sl-dropdown>`
          : null}
      </sl-button-group>
    </div>
    ${cells.map((cell, cell_index) => {
      return html`<${IridiumCell}
        key=${cell.id + ''}
        index=${cell_index + ''}
        interpreter=${interpreter}
        onDelete=${() => _onDelete(cell.id)}
        onPinToggle=${() => _onPinToggle(cell.id)}
        onUpdate=${_onUpdate(cell.id)}
        addBefore=${() => _onNewBefore(cell_index)}
        sourceCode=${cell.sourceCode}
        saveNotebook=${() => props.onSave(cells)}
        pinned=${cell.pin}
      />`;
    })}
    <div className="CellsAfter">
      <sl-icon-button
        name="plus-square"
        label="New"
        onClick=${() => _onNew()}
      ></sl-icon-button>
    </div>
  </div>`;
};

export default IridiumNotebook;
