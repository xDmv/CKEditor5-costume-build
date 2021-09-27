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

		schema.addChildCheck( ( context, childDefinition ) => {
			if ( context.endsWith( 'insertBoxDescription' ) && childDefinition.name == 'insertBox' ) {
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
				classes: 'simple-box'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'insertBox',
			view: {
				name: 'section',
				classes: 'simple-box'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'insertBox',
			view: ( modelElement, { writer: viewWriter } ) => {
				const section = viewWriter.createContainerElement( 'section', { class: 'simple-box' } );

				return toWidget( section, viewWriter, { label: 'simple box widget' } );
			}
		} );

		// <insertBoxTitle> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'insertBoxTitle',
			view: {
				name: 'h1',
				classes: 'simple-box-title'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'insertBoxTitle',
			view: {
				name: 'h1',
				classes: 'simple-box-title'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'insertBoxTitle',
			view: ( modelElement, { writer: viewWriter } ) => {
				const h1 = viewWriter.createEditableElement( 'h1', { class: 'simple-box-title' } );

				return toWidgetEditable( h1, viewWriter );
			}
		} );

		// <insertBoxDescription> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'insertBoxDescription',
			view: {
				name: 'input',
				classes: 'simple-box-description'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'insertBoxDescription',
			view: {
				name: 'input',
				classes: 'simple-box-description'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'insertBoxDescription',
			view: ( modelElement, { writer: viewWriter } ) => {
				const input = viewWriter.createEditableElement( 'input', { class: 'insert-box-description' } );
				return toWidgetEditable( input, viewWriter );
			}
		} );
	}
}

class insertInsertTestsCommand extends Command {
	execute() {
		this.editor.model.change( writer => {
			console.log('writer: ', writer);
			this.editor.model.insertContent( createSimpleBox( writer ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'simpleBox' );

		this.isEnabled = allowedIn !== null;
	}
}

function createSimpleBox( writer ) {
	const simpleBox = writer.createElement( 'simpleBox' );
	const simpleBoxTitle = writer.createElement( 'simpleBoxTitle' );
	const simpleBoxDescription = writer.createElement( 'simpleBoxDescription' );
	writer.append( simpleBoxTitle, simpleBox );
	writer.append( simpleBoxDescription, simpleBox );
	writer.appendElement( 'paragraph', simpleBoxDescription );

	return simpleBox;
}
