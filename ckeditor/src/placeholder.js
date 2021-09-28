import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';

import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

import './theme/styles.css';

export class Placeholder extends Plugin {
	static get requires() {
		return [ PlaceholderEditing, PlaceholderUI ];
	}
}

class PlaceholderCommand extends Command {
	execute( { value } ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change( writer => {
			const placeholder = writer.createElement( 'placeholder', {
				...Object.fromEntries( selection.getAttributes() ),
				name: value
			} );

			editor.model.insertContent( placeholder );

			writer.setSelection( placeholder, 'on' );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild( selection.focus.parent, 'placeholder' );

		this.isEnabled = isAllowed;
	}
}

class PlaceholderUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;
		const placeholderNames = editor.config.get( 'placeholderConfig.types' );

		editor.ui.componentFactory.add( 'placeholder', locale => {
			const dropdownView = createDropdown( locale );

			addListToDropdown( dropdownView, getDropdownItemsDefinitions( placeholderNames ) );

			dropdownView.buttonView.set( {
				label: t( 'Placeholder' ),
				tooltip: true,
				withText: true
			} );

			const command = editor.commands.get( 'placeholder' );
			dropdownView.bind( 'isEnabled' ).to( command );

			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( 'placeholder', { value: evt.source.commandParam } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}

function getDropdownItemsDefinitions( placeholderNames ) {
	const itemDefinitions = new Collection();

	for ( const name of placeholderNames ) {
		const definition = {
			type: 'button',
			model: new Model( {
				commandParam: name,
				label: name,
				withText: true
			} )
		};

		itemDefinitions.add( definition );
	}

	return itemDefinitions;
}

class PlaceholderEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {

		// const eventInfo = new EventInfo( this, 'eventName' );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'placeholder', new PlaceholderCommand( this.editor ) );

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'placeholder' ) )
		);
		this.editor.config.define( 'placeholderConfig', {
			types: [ 'date', 'first name', 'surname' ]
		} );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'placeholder', {
			allowWhere: '$text',
			isInline: true,
			isObject: true,
			allowAttributesOf: '$text',
			allowAttributes: [ 'name' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div',
				classes: [ 'placeholder' ]
			},
			model: ( viewElement, { writer: modelWriter } ) => {
				const name = viewElement.getChild( 0 ).data.slice( 1, -1 );

				return modelWriter.createElement( 'placeholder', { name } );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( editor ) => {
				return editor.createRawElement(

				)
			}
			// 	( modelItem, { writer: viewWriter } ) => {
			// 	const widgetElement = createPlaceholderView( modelItem, viewWriter );
			//
			// 	return toWidget( widgetElement, viewWriter );
			// }
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( modelItem, { writer: viewWriter } ) => createPlaceholderView( modelItem, viewWriter )
		} );

		function createPlaceholderView( modelItem, viewWriter ) {
			const name = modelItem.getAttribute( 'name' );

			console.log('name: ', name);
			if (name === 'color') {
				const placeholderView = viewWriter.createContainerElement( 'span', {
					class: 'colors'
				}, {
					isAllowedInsideAttributeElement: true
				} );

				const innerText = viewWriter.createText( name );

				viewWriter.insert( viewWriter.createPositionAt( placeholderView, 0 ), innerText );
				// viewWriter.setAttribute('id', 1);

				// emitter.on( 'pluginclick', ( eventInfo, data ) => {
				// 	console.log( 'foo:', data );
				// 	eventInfo.stop();
				// } );
				console.log('placeholderView: ', placeholderView);
				// placeholderView.setAttribute('onclick', console.log('dfdfdf'))
				return placeholderView;
			}

			const placeholderView = viewWriter.createContainerElement( 'span', {
				class: 'placeholder'
			}, {
				isAllowedInsideAttributeElement: true
			} );


			const innerText = viewWriter.createText( name );

			viewWriter.insert( viewWriter.createPositionAt( placeholderView, 0 ), innerText );

			return placeholderView;
		}
	}
}

