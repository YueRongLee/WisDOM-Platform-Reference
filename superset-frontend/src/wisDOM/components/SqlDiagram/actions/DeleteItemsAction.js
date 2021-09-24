import { Action, InputType } from '@projectstorm/react-canvas-core';

/**
 * Deletes all selected items
 */
export class DeleteItemsAction extends Action {
  constructor(options = {}) {
    const keyCodes = options.keyCodes || [46, 8];
    const modifiers = {
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      ...options.modifiers,
    };

    super({
      type: InputType.KEY_DOWN,
      fire: event => {
        const { keyCode, ctrlKey, shiftKey, altKey, metaKey } = event.event;
        const body = document.getElementsByTagName('body')[0];

        if (body !== event.event.target) {
          return;
        }

        if (
          keyCodes.indexOf(keyCode) !== -1 &&
          JSON.stringify({ ctrlKey, shiftKey, altKey, metaKey }) ===
            JSON.stringify(modifiers)
        ) {
          this.engine
            .getModel()
            .getSelectedEntities()
            .forEach(model => {
              // only delete items which are not locked
              if (!model.isLocked()) {
                model.remove();
              }
            });
          this.engine.repaintCanvas();
        }
      },
    });
  }
}
