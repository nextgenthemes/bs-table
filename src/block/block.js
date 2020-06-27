import classnames from 'classnames/dedupe';

const wp = window.wp;
const { __ } = wp.i18n;
const { addFilter } = wp.hooks;
const { assign } = window.lodash;
const {
	createHigherOrderComponent,
} = wp.compose;

const {
	Fragment,
} = wp.element;

const {
	RichText,
	InspectorControls,
	getColorClassName,
} = wp.editor;

const {
	PanelBody,
	TextControl,
	ToggleControl,
} = wp.components;

const filterBlocks = ( settings ) => {
	console.log( settings );

	if ( settings.name !== 'core/table' ) {
		return settings;
	}

	const newSettings = {
		...settings,
		attributes: {
			...settings.attributes, // spread in old attributes so we don't lose them!
			tableClass: { // here is our new attribute
				type: 'string',
				default: 'table ',
			},
			tableBordered: { // here is our new attribute
				type: 'boolean',
				default: false,
			},
			tableStriped: { // here is our new attribute
				type: 'boolean',
				default: false,
			},
			tableHover: { // here is our new attribute
				type: 'boolean',
				default: true,
			},
		},
		save( { attributes } ) {
			const {
				hasFixedLayout,
				head,
				body,
				foot,
				backgroundColor,
				caption,
				tableBordered,
				tableStriped,
				tableHover,
				tableClass,
			} = attributes;
			const isEmpty = ! head.length && ! body.length && ! foot.length;

			if ( isEmpty ) {
				return null;
			}

			const classes = buildTableClasses( attributes );

			const hasCaption = ! RichText.isEmpty( caption );

			const Section = ( { type, rows } ) => {
				if ( ! rows.length ) {
					return null;
				}

				const Tag = `t${ type }`;

				return (
					<Tag>
						{ rows.map( ( { cells }, rowIndex ) => (
							<tr key={ rowIndex }>
								{ cells.map(
									( { content, tag, scope, align }, cellIndex ) => {
										const cellClasses = classnames( {
											[ `has-text-align-${ align }` ]: align,
										} );

										return (
											<RichText.Content
												className={
													cellClasses ?
														cellClasses :
														undefined
												}
												data-align={ align }
												tagName={ tag }
												value={ content }
												key={ cellIndex }
												scope={
													tag === 'th' ? scope : undefined
												}
											/>
										);
									}
								) }
							</tr>
						) ) }
					</Tag>
				);
			};

			return (
				<figure>
					<table className={ classes === '' ? undefined : classes }>
						<Section type="head" rows={ head } />
						<Section type="body" rows={ body } />
						<Section type="foot" rows={ foot } />
					</table>
					{ hasCaption && (
						<RichText.Content tagName="figcaption" value={ caption } />
					) }
				</figure>
			);
		},
	};

	return newSettings;
};

addFilter(
	'blocks.registerBlockType',
	'example/filter-blocks',
	filterBlocks
);

function buildTableClasses( attributes ) {
	const {
		hasFixedLayout,
		backgroundClass,
		tableStriped,
		tableBordered,
		tableHover,
		tableClass,
	} = attributes;

	const classes = classnames(
		tableClass.split( ' ' ),
		backgroundClass,
		{
			table: true,
			'has-fixed-layout': hasFixedLayout,
			'has-background': !! backgroundClass,
			'table-bordered': tableBordered,
			'table-striped': tableStriped,
			'table-hover': tableHover,
		}
	);

	return classes;
}

const tableClassControl = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( 'core/table' !== props.name ) {
			return (
				<BlockEdit { ...props } />
			);
		}

		const {
			tableStriped,
			tableBordered,
			tableHover,
			tableClass,
		} = props.attributes;

		return (
			<Fragment>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody
						title={ __( 'Table classes' ) }
						initialOpen={ true }
					>
						<ToggleControl
							label={ __( 'Striped' ) }
							checked={ !! tableStriped }
							onChange={ () => props.setAttributes( {
								tableStriped: ! tableStriped,
								tableClass: buildTableClasses( props.attributes ),
							} ) }
						/>
						<ToggleControl
							label={ __( 'Bordered' ) }
							checked={ !! tableBordered }
							onChange={ () => props.setAttributes( {
								tableBordered: ! tableBordered,
								tableClass: buildTableClasses( props.attributes ),
							} ) }
						/>
						<ToggleControl
							label={ __( 'Hover' ) }
							checked={ !! tableHover }
							onChange={ () => props.setAttributes( {
								tableHover: ! tableHover,
								tableClass: buildTableClasses( props.attributes ),
							} ) }
						/>
						<TextControl
							label={ __( '<table> classes' ) }
							type="text"
							value={ tableClass }
							onChange={ ( value ) =>
								props.setAttributes( { tableClass: value } )
							}
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'tableClassControl' );

addFilter( 'editor.BlockEdit', 'extend-block-example/with-spacing-control', tableClassControl );
