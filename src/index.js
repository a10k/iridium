import { html, render } from 'htm/preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import localForage from 'localforage';
import IridiumNotebook from './components/IridiumNotebook';
import icons from './icons';

import './editor.scss';
import './inspector.scss';
import '@shoelace-style/shoelace/dist/themes/base.css';

import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/button-group/button-group.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { registerIconLibrary } from '@shoelace-style/shoelace/dist/utilities/icon-library.js';

registerIconLibrary('default', {
  resolver: icons,
  mutator: (svg) => svg.setAttribute('fill', 'currentColor'),
});

const IridiumApp = (props) => {
  const [current, _current] = useState(props.Ir.get_recent() || null);
  const [cells, _cells] = useState(null);
  const [list, _list] = useState([]);

  useEffect(() => {
    props.Ir.set_recent(current);
    props.Ir.load(current).then((loaded) => {
      if (loaded) {
        _cells(loaded);
      } else {
        _cells([]);
      }
    });
  }, [current]);

  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = () => {
    props.Ir.list().then((all) => {
      if (all.length == 0) {
      } else {
        _list(all);
      }
    });
  };

  const onSave = (cells) => {
    props.Ir.save(current, cells);
  };

  const onReady = (main) => {
    props.Ir.ready(main);
  };

  return html`<div class="IridiumApp">
    ${cells
      ? html`<${IridiumNotebook}
          title=${current}
          cells=${cells}
          onSave=${onSave}
          onReady=${onReady}
          doRefresh=${refreshList}
          list=${list}
          _current=${_current}
          _cells=${_cells}
        />`
      : null}
  </div>`;
};

window.Iridium = {
  IridiumApp: IridiumApp,
  html: html,
  render: render,
  useEffect: useEffect,
  useRef: useRef,
  useState: useState,
  save: (name, cells) => {
    return localForage.setItem(name + '', cells);
  },
  new: (name) => {
    return localForage.setItem(name, []);
  },
  load: (name) => {
    return localForage.getItem(name + '');
  },
  list: () => {
    return localForage.keys();
  },
  delete: (name) => {
    localForage.removeItem(name);
  },
  get_recent: () => {
    return localStorage.getItem('IridiumRecent');
  },
  set_recent: (name) => {
    if (name) {
      return localStorage.setItem('IridiumRecent', name);
    } else {
      return false;
    }
  },
  ready: (main) => {
    window.IridiumMain = main;
  },
  toggle_editor: () => {},
  localForage: localForage,
};

// render(
//   html`<${IridiumApp} Ir=${Iridium} />`,
//   document.getElementById('iridium-root'),
// );
