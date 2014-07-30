jQuery(function($) {
	var title = 'WP Table Tag Gen';

	function changeStyles() {
		var w = $( window ).width()*0.9;
		var h = $( window ).height()*0.9;

		$( '#TB_window' ).css({
			'width' : w + 'px',
			'margin-left' : -w*0.5 + 'px'
		});

		$( '#TB_ajaxContent' ).css({
			'padding': '0',
			'width' : w + 'px',
			'height' : h + 'px'
		});
	}

	if( window.QTags ){
		QTags.addButton( 'ttg', 'table', function() {
			tb_show( title, '#TB_inline?height=&width=&inlineId=wp-table-tag-gen', false );

			changeStyles();

			$( window ).resize(function() {
				if( $('#TB_ajaxWindowTitle').text() === title ) {
					changeStyles();
				}
			});
		}, false, false, 'Insert a table tag from WP Table Tag Gen.', 116);

		if( window.localStorage ) {
			localStorage.clear();
			localStorage.setItem( 'index', 0 );
			localStorage.setItem( 'undo', 0 );
			localStorage.setItem( 'o0', JSON.stringify({
				row : $( '[name=row]' ).val(),
				col : $( '[name=col]' ).val()
			}));
			localStorage.setItem( 'data0', $( '#tag-wrapper' ).html() );
			$( '#undo' ).attr( 'disabled', 'disabled' );
			$( '#redo' ).attr( 'disabled', 'disabled' );
		}
	}

});