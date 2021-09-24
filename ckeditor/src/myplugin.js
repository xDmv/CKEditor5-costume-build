import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { addListToDropdown, createDropdown } from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import defaultIcon from './icons/icon.svg';

export class MyPlugin extends Plugin {
	static get requires() {
		return [ MyPluginEditing, MyPluginUI ];
	}
}

class MyPluginEditing  extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'insertMyPlugin', new InsertMyPluginCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'MyPlugin', {
			isObject: true,
			allowWhere: '$block',
		} );

		schema.register( 'MyPluginTitle', {
			isLimit: true,
			allowIn: 'MyPlugin',
			allowContentOf: '$block',
		} );

		schema.register( 'MyPluginDescription', {
			isLimit: true,
			allowIn: 'simpleBox',
			allowContentOf: '$root'
		} );

		schema.addChildCheck( ( context, childDefinition ) => {
			if ( context.endsWith( 'MyPluginDescription' ) && childDefinition.name == 'MyPlugin' ) {
				return false;
			}
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// conversion.for( 'upcast' ).elementToElement( {
		// 	model: 'MyPlugin',
		// 	view: {
		// 		name: 'section',
		// 		classes: 'simple-box'
		// 	}
		// } );
		// conversion.for( 'dataDowncast' ).elementToElement( {
		// 	model: 'MyPlugin',
		// 	view: {
		// 		name: 'section',
		// 		classes: 'simple-box'
		// 	}
		// } );
		//
		// conversion.for( 'editingDowncast' ).elementToElement( {
		// 	model: 'MyPlugin',
		// 	view: ( modelElement, { writer: viewWriter } ) => {
		// 		const section = viewWriter.createContainerElement( 'section', { class: 'my-plugin-box' } );
		//
		// 		return toWidget( section, viewWriter, { widgetLabel: 'my plugin' } );
		// 	}
		// } );

		conversion.for( 'upcast' )
			.elementToElement( {
				view: { name: 'aside', classes: [ 'side-card' ] },
				model: upcastCard
			} )
			.elementToElement( {
				view: { name: 'div', classes: [ 'side-card-title' ] },
				model: 'sideCardTitle'
			} )
			.elementToElement( {
				view: { name: 'div', classes: [ 'side-card-section' ] },
				model: 'sideCardSection'
			} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'MyPlugin',
			view: {
				name: 'section',
				classes: 'simple-box'
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'MyPlugin',
			view: ( modelElement, { writer: viewWriter } ) => {
				const section = viewWriter.createContainerElement( 'section', { class: 'my-plugin-box' } );

				return toWidget( section, viewWriter, { widgetLabel: 'my plugin' } );
			}
		} );
		// // The downcast conversion must be split as you need a widget in the editing pipeline.
		// conversion.for( 'editingDowncast' ).elementToElement( {
		// 	model: 'sideCard',
		// 	view: downcastSideCard( editor, { asWidget: true } ),
		// 	triggerBy: {
		// 		attributes: [ 'cardType', 'cardURL' ],
		// 		children: [ 'sideCardSection' ]
		// 	}
		// } );
		// conversion.for( 'dataDowncast' ).elementToElement( {
		// 	model: 'sideCard',
		// 	view: downcastSideCard( editor, { asWidget: false } )
		// } );
	}
}

class MyPluginUI extends Plugin {
	init() {

		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add(
			'myPlugin', locale => {
				const command = editor.commands.get( 'insertMyPlugin' );

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

				this.listenTo( buttonView, 'execute', () => editor.execute( 'insertMyPlugin' ) );

				return buttonView;
			}
		);
	}
}

class InsertMyPluginCommand extends Command {
	execute() {
		const model = this.editor.model;
		// const selection = model.document.selection;
		// const insertionRange = findOptimalInsertionRange( selection, model );

		model.change( writer => {
			model.insertContent( createMyPlugin( writer ) );

			// const sideCard = writer.createElement( 'sideCard', { cardType: 'default' } );
			// const title = writer.createElement( 'sideCardTitle' );
			// const section = writer.createElement( 'sideCardSection' );
			// const paragraph = writer.createElement( 'paragraph' );

			// writer.insert( title, sideCard, 0 );
			// writer.insert( section, sideCard, 1 );
			// writer.insert( paragraph, section, 0 );

			// // model.insertContent( sideCard, insertionRange );

			// writer.setSelection( writer.createPositionAt( title, 0 ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'simpleBox' );

		this.isEnabled = allowedIn !== null;
	}
}

function createMyPlugin( writer ) {
	const simpleBox = writer.createElement( 'myPlugin' );
	const simpleBoxTitle = writer.createElement( 'myPluginTitle' );
	const simpleBoxDescription = writer.createElement( 'myPluginDescription' );
	writer.append( simpleBoxTitle, simpleBox );
	writer.append( simpleBoxDescription, simpleBox );
	writer.appendElement( 'paragraph', simpleBoxDescription );

	return MyPlugin;
}

/* */
const addActionButton = ( text, callback, domElement, editor ) => {
	const domDocument = domElement.ownerDocument;

	const button = createElement( domDocument, 'button', {}, [ text ] );

	button.addEventListener( 'click', () => {
		editor.model.change( callback );
	} );

	domElement.appendChild( button );

	return button;
};

const addActionInput = ( text, callback, domElement, editor ) => {
	const domDocument = domElement.ownerDocument;

	const input = createElement( domDocument, 'input', {}, [ text ] );

	domElement.appendChild( input );

	return input;
};

const createActionsView = ( editor, modelElement ) => function( domElement ) {
	addActionButton( 'Set URL', writer => {
		// eslint-disable-next-line no-alert
		const newURL = prompt( 'Set URL', modelElement.getAttribute( 'cardURL' ) || '' );

		writer.setAttribute( 'cardURL', newURL, modelElement );
	}, domElement, editor );

	const currentType = modelElement.getAttribute( 'cardType' );
	const newType = currentType === 'default' ? 'alternate' : 'default';

	const addButton = addActionButton( 'Add section', writer => {
		writer.insertElement( 'sideCardSection', modelElement, 'end' );
	}, domElement, editor );
}

const downcastSideCard = ( editor, { asWidget } ) => {
	return ( modelElement, { writer, consumable, mapper } ) => {
		const type = modelElement.getAttribute( 'cardType' ) || 'default';

		// The main view element for the side card.
		const sideCardView = writer.createContainerElement( 'aside', {
			class: `side-card side-card-${ type }`
		} );

		// Create inner views from the side card children.
		for ( const child of modelElement.getChildren() ) {
			const childView = writer.createEditableElement( 'div' );

			// Child is either a "title" or "section".
			if ( child.is( 'element', 'sideCardTitle' ) ) {
				writer.addClass( 'side-card-title', childView );
			} else {
				writer.addClass( 'side-card-section', childView );
			}

			// It is important to consume and bind converted elements.
			consumable.consume( child, 'insert' );
			mapper.bindElements( child, childView );

			// Make it an editable part of the widget.
			if ( asWidget ) {
				toWidgetEditable( childView, writer );
			}

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), childView );
		}

		const urlAttribute = modelElement.getAttribute( 'cardURL' );

		// Do not render an empty URL field.
		if ( urlAttribute ) {
			const urlBox = writer.createRawElement( 'div', {
				class: 'side-card-url'
			}, function( domElement ) {
				domElement.innerText = `URL: "${ urlAttribute }"`;
			} );

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), urlBox );
		}

		// Inner element used to render a simple UI that allows to change the side card's attributes.
		// It will only be needed in the editing view inside the widgetized element.
		// The data output should not contain this section.
		if ( asWidget ) {
			const actionsView = writer.createRawElement( 'div', {
				class: 'side-card-actions',
				contenteditable: 'false', 			// Prevents editing of the element.
				'data-cke-ignore-events': 'true'	// Allows using custom UI elements inside the editing view.
			}, createActionsView( editor, modelElement ) ); // See the full code for details.

			writer.insert( writer.createPositionAt( sideCardView, 'end' ), actionsView );

			toWidget( sideCardView, writer, { widgetLabel: 'Side card' } );
		}

		return sideCardView;
	};
};

const upcastCard = ( viewElement, { writer } ) => {
	const sideCard = writer.createElement( 'sideCard' );

	const type = getTypeFromViewElement( viewElement );
	writer.setAttribute( 'cardType', type, sideCard );

	const urlWrapper = [ ...viewElement.getChildren() ].find( child => {
		return child.is( 'element', 'div' ) && child.hasClass( 'side-card-url' );
	} );

	if ( urlWrapper ) {
		writer.setAttribute( 'cardURL', urlWrapper.getChild( 0 ).data, sideCard );
	}

	return sideCard;
};
