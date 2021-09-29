import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import defaultIcon from './icons/icon.svg';


export class Insert extends Plugin {
	static get requires() {
		return [ InsertUI, InsertEditing  ];
	}
}

class InsertUI extends Plugin {
	init() {

		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add(
			'InsertTests', locale => {
				const command = editor.commands.get( 'insertInsertTests' );

				const buttonView = new ButtonView( locale );

				buttonView.set( {
					label: t( 'Insert' ),
					withText: true,
					tooltip: true,
					icon: defaultIcon,
					isEnabled: true,
					isOn: true,
				} );

				buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

				this.listenTo( buttonView, 'execute', () => editor.execute( 'insertInsertTests' ) );

				return buttonView;
			}
		);
	}
}

class InsertEditing  extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'insertInsertTests', new insertInsertTestsCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'insertBox', {
			isObject: true,
			allowWhere: '$block',
		} );

		schema.register( 'insertBoxTitle', {
			isLimit: true,
			allowIn: 'insertBox',
			allowContentOf: '$block',
		} );

		schema.register( 'insertBoxDescription', {
			isLimit: true,
			allowIn: 'insertBox',
			allowContentOf: '$root'
		} );

		schema.register( 'insertBoxNewElement', {
			isLimit: true,
			allowIn: 'insertBox',
			allowContentOf: '$root'
		} );

		schema.addChildCheck( ( context, childDefinition ) => {
			if ( context.endsWith( 'insertBoxDescription' ) && childDefinition.name === 'insertBox' ) {
				return false;
			}
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			model: 'insertBox',
			view: {
				name: 'section',
				classes: 'insert-box'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'insertBox',
			view: {
				name: 'section',
				classes: 'insert-box'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'insertBox',
			view: ( modelElement, { writer: viewWriter } ) => {
				const section = viewWriter.createContainerElement( 'section', { class: 'insert-box' } );

				return toWidget( section, viewWriter, { label: 'insert box widget' } );
			}
		} );

		// <insertBoxTitle> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'insertBoxTitle',
			view: {
				name: 'h1',
				classes: 'insert-box-title'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'insertBoxTitle',
			view: {
				name: 'h1',
				classes: 'insert-box-title'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'insertBoxTitle',
			view: ( modelElement, { writer: viewWriter } ) => {
				const h1 = viewWriter.createEditableElement( 'h1', { class: 'insert-box-title' } );

				return toWidgetEditable( h1, viewWriter );
			}
		} );

		// <insertBoxDescription> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'insertBoxDescription',
			view: {
				name: 'div',
				classes: 'insert-box-description'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'insertBoxDescription',
			view: {
				name: 'div',
				classes: 'insert-box-description'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'insertBoxDescription',
			view: ( modelElement, { writer: viewWriter } ) => {
				const div = viewWriter.createEditableElement( 'div', { class: 'insert-box-description' } );
				return toWidgetEditable( div, viewWriter );
			}
		} );

		// <insertBoxDescription> converters Add new element
		conversion.for( 'upcast' ).elementToElement( {
			model: 'insertBoxNewElement',
			view: {
				name: 'input',
				classes: 'insert-box-description'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'insertBoxNewElement',
			view: {
				name: 'input',
				classes: 'insert-box-description'
			}
		} );
		// conversion.for( 'downcast' )
		// 	.elementToElement( {
		// 		model: 'myElement',
		// 		view: 'input'
		// 	} )
		// 	.attributeToAttribute( {
		// 		model: 'owner-id',
		// 		view: 'data-owner-id'
		// 	} )
		// 	.attributeToAttribute( {
		// 		model: 'type',
		// 		view: modelAttributeValue => ( {
		// 			key: 'class',
		// 			value: `my-element my-element-${ modelAttributeValue }`
		// 		} )
		// 	} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'insertBoxNewElement',
			view: ( modelElement, { writer } ) => {
				// writer.editing.view.focus();
				//modelElement.setAttribute( 'ownerId', 1 );
				return writer.createContainerElement( 'input', {
					//'data-owner-id': modelElement.getAttribute( 'ownerId' ),
					class: `element input`
				} );
			},
			// triggerBy: {
			// 	attributes: [ 'ownerId', 'type' ]
			// }
		} );
	}
}

class insertInsertTestsCommand extends Command {
	execute() {
		this.editor.model.change( writer => {
			this.editor.model.insertContent( createInsertBox( writer ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'insertBox' );

		this.isEnabled = allowedIn !== null;
	}
}

function createInsertBox( writer ) {
	const insertBox = writer.createElement( 'insertBox' );
	const insertBoxTitle = writer.createElement( 'insertBoxTitle' );
	const insertBoxDescription = writer.createElement( 'insertBoxDescription' );
	const insertBoxNewElement = writer.createElement( 'insertBoxNewElement' );
	writer.append( insertBoxTitle, insertBox );
	writer.append( insertBoxDescription, insertBox );
	writer.append( insertBoxNewElement, insertBox );
	writer.appendElement( 'paragraph', insertBoxDescription );

	return insertBox;
}
