jQuery(function($) {

var wrapper     = '#tag-wrapper',
		$wrapper    = $( wrapper ),
		$table      = $wrapper.find( 'table' ),
		$ttgHeader  = $( '#ttg-header' ),
		$row        = $ttgHeader.find( '[name=row]' ),
		$col        = $ttgHeader.find( '[name=col]' ),
		$rowcol     = $ttgHeader.find( '[name=row], [name=col]' ),
		$button     = $ttgHeader.find( '.button' ),
		classMerged = 'TTG-merged',
		timer;

generateTable( $row.val(), $col.val() );
generateTags();

$( '#class, #chars' ).show();
$( '#output-chars, #output-class' ).hide();
$.cookie( 'checked', '' );
$button.not( '#undo, #redo' ).removeAttr( 'disabled' );

$wrapper.mousedown(function( e ) {
	e.metaKey = false;
}).selectable();

$rowcol.mouseup(function() {
	generateTable( $row.val(), $col.val() );
	generateTags( history() );
}).mousewheel( eventHandler );

$rowcol.keyup(function() {
	var input = $( this ).val()*1;
	if ( /[0-9]/.test( input ) === false ) {
		getMessage( '#ent-num' );
		return;
	}
	if ( input < 1 ) {
		getMessage( '#ent-natural-num' );
		return;
	}
	generateTable( $row.val(), $col.val() );
	generateTags( history() );
});

if ( window.localStorage ) {
	localStorage.clear();
	localStorage.setItem( 'index', 0 );
	localStorage.setItem( 'undo', 0 );
} else {
	$( '#undo, #redo, #initialize' ).hide();
}

$( '#output-chars' ).click(function() {
	getMessage();

	$button.not( '#undo, #redo' ).removeAttr( 'disabled' );
	$( '#chars' ).show();
	$( this ).hide();

	$rowcol.mousewheel( eventHandler );

	$wrapper.find( 'td, th' ).each(function() {
		content = $( this ).children( 'textarea' ).val();
		$( this ).children( 'textarea' ).remove();
		$( this ).text( content );
	});

	generateTags( history() );
});

$( '#output-class' ).click(function() {
	getMessage();

	$button.not( '#undo, #redo' ).removeAttr( 'disabled' );
	$( '#class' ).show();
	$( this ).hide();

	$rowcol.mousewheel( eventHandler );

	$wrapper.find( 'td, th' ).each(function() {
		var content = $( this ).children( 'input' ).val();
		$( this ).children( 'input' ).remove();
		$( this ).addClass( content ).removeClass( 'class' );
	});

	var tableClass = $( '.table-class' ).val();
	$table.removeAttr( 'class' );
	if ( tableClass ) {
		$table.addClass( tableClass );
	}

	var trClass = [];
	$( '.tr-class' ).each(function( i ) {
		trClass[ i ] = $( this ).val();
	});
	$wrapper.find( 'tr' ).each(function( i ) {
		$( this ).removeAttr( 'class' );
		if ( trClass[ i ] != undefined ) {
			$( this ).addClass( trClass[ i ] );
		}
	});

	removeInput();
	generateTags( history() );
});

$( '#chars' ).click(function() {
	getMessage( '#ent-chars' );
	$( '.ui-selected' ).removeClass( 'ui-selected' );

	$button.not( '#output-chars' ).attr( 'disabled', 'disabled' );
	$( this ).hide();
	$( '#output-chars' ).show();

	$rowcol.unbind( 'mousewheel' )

	$wrapper.find( 'td, th' ).each(function() {
		var text = $( this ).text();
		$( this ).html( '<textarea rows="2" name="textarea">' + text + '</textarea> ' );
	});
	if ( isUA( 'webkit' ) ) {
		$wrapper.find( 'td:has( input ), th:has( input )' ).css( 'padding', '1px 3px 2px' );
	}
});

$( document ).on({
		'focus' : function() {
			var tr = $( this ).parents( 'tr' );
			tr.find( 'textarea' ).attr( 'rows', '4' );
			tr.prevAll().find( 'textarea' ).attr( 'rows', '2' );
			tr.nextAll().find( 'textarea' ).attr( 'rows', '2' );
		},
		'blur' : function() {
			$table.find( 'textarea' ).attr( 'rows', '2' );
		}
	},
	'[name=textarea]'
);

$( '#class' ).click(function() {
	getMessage( '#ent-class-names' );

	$button.not( '#output-class' ).attr( 'disabled', 'disabled' );
	$( this ).hide();
	$( '#output-class' ).show();

	$rowcol.unbind( 'mousewheel' );

	$wrapper.find( 'td, th' ).each(function() {
		$( this ).removeClass( 'ui-selectee ui-selected' + ' ' + classMerged );
		var thisClass = $( this ).attr( 'class' );
		if ( thisClass == undefined ) thisClass = '';
		$( '<input type="text" value="' + thisClass + '" size="5">' ).appendTo( this );
		$( this ).children().addClass( 'class' );
	});

	var top = -30;
	if ( isUA( 'webkit' ) ) {
		top = -33;
		$wrapper.find( 'td:has( input ), th:has( input )' ).css( 'padding', '3px' );
	}
	var left = $table.find( 'tr:first' ).position().left;

	var tableClass = $table.attr( 'class' );

	if ( tableClass != undefined ) {
		tableClass = tableClass
		.replace( /ui-selecte(d\s|d)/g, '' )
		.replace( /ui-selecte(e\s|e)/g, '' );
	}
	if ( ! tableClass ) {
		tableClass = '';
	}
	$( '<input />' )
		.val( tableClass )
		.attr({
			'type' : 'text',
			'size' : '5',
			'placeholder' : 'table',
			'class' : 'table-class'
		})
		.css({
			'position' : 'absolute',
			'top' :  top + 'px',
			'left' : ( left + 4 )+ 'px'
		}).appendTo( wrapper );

	$( '<label />' )
		.attr( 'id', 'stripe-label' )
		.css({
			'position' : 'absolute',
			'top' :  ( top + 5 ) + 'px',
			'left' : ( left - 69 )+ 'px'
		}).appendTo( wrapper );

	$( '<input />' )
		.attr({
			'type' : 'checkbox',
			'id' : 'stripe'
		}).appendTo( '#stripe-label' ).after( '<span>stripe</span>' );

	$wrapper.find( 'tr' ).each(function() {
		if ( isUA( 'firefox' ) ) {
			top = $( this ).position().top + 3;
		} else if ( isUA( 'webkit' ) ) {
			top = $( this ).position().top + 4;
		} else if ( isUA( 'meie|trident' ) ) {
			top = $( this ).position().top + 6;
		} else {
			top = $( this ).position().top + 3;
		}
		var left = $( this ).position().left;

		var trClass = $( this ).attr( 'class' );
		if ( trClass != undefined ) {
			trClass = trClass
			.replace( /ui-selecte(d\s|d)/g, '' )
			.replace( /ui-selecte(e\s|e)/g, '' );
		}
		if ( ! trClass ) trClass = '';

		$( '<input />' )
			.val( trClass )
			.attr({
				'type' : 'text',
				'size' : '5',
				'placeholder' : 'tr',
				'class' : 'tr-class'
			})
			.css({
				'position' : 'absolute',
				'top' :  top + 'px',
				'left' : (left - 75) + 'px'
			}).appendTo( wrapper );
	});

	$( '#stripe' ).removeAttr( 'checked' );

	var checked = $.cookie( 'checked' );
	if ( checked == 1 ) $( '#stripe' ).attr( 'checked', 'checked' );
	var classes = [];
	$( '#stripe-label' ).click(function() {
		if ( $( '#stripe' ).is( ':checked' ) ) {
			$.cookie( 'checked' , 1 );
			$( '.tr-class' ).each(function( i ) {
				classes[ i ] = $( this ).val();
				var trVal = $( this ).val();
				if ( i % 2 == 0 ) {
					$( this ).val( 'even' + ( trVal != '' ? ' ' + trVal : '' ) );
				} else {
					$( this ).val( 'odd' + ( trVal != '' ? ' ' + trVal : '' ) );
				}
			});
		} else {
			$.cookie( 'checked' , '' );
			$( '.tr-class' ).each(function( i ) {
				classes[ i ] = $( this ).val();
				if ( classes[ i ] != undefined ) {
					classes[ i ] =  classes[ i ]
					.replace( /eve(n\s|n)/g, '' )
					.replace( /od(d\s|d)/g, '' );
					$( this ).val( classes[ i ]);
				} else {
					$( this ).val( '' );
				}
			});
		}
	});
});

$( window ).resize(function() {
	var top = -30;
	if ( isUA( 'webkit' ) ) {
		top = -33;
	}
	var left = $table.find( 'tr:first' ).position().left;

	$( '.table-class' )
		.css({
			'position' : 'absolute',
			'top' :  top + 'px',
			'left' : ( left + 4 )+ 'px'
		});

	$( '#stripe-label' )
		.css({
			'position' : 'absolute',
			'top' : ( top + 5 ) + 'px',
			'left' : ( left - 69 )+ 'px'
		});

	top = [];
	left = 0;
	$wrapper.find( 'tr' ).each(function( i ) {
		if ( isUA( 'firefox' ) ) {
			top[ i ] = $( this ).position().top + 3;
		} else if ( isUA( 'webkit' ) ) {
			top[ i ] = $( this ).position().top + 4;
		}
		left = $( this ).position().left;
	});
	$( '.tr-class' ).each(function( i ) {
		$( this )
		.css({
			'position' : 'absolute',
			'top' :  top[ i ] + 'px',
			'left' : (left - 75) + 'px'
		});
	});
});



$( '#merge' ).click(function() {
	var td = null;
	var th = null;

	var selected = $wrapper.find( 'td.ui-selected, th.ui-selected' );

	if ( selected.length === 0 ) {
		getMessage( '#select-cells' );
	}

	selected.each(function() {
		if ( $( this ).get(0).tagName.match( /td/i ) ) {
			td = true;
		} else if ( $( this ).get(0).tagName.match( /th/i ) ) {
			th = true;
		}
	});

	if ( td == true && th == true ) {
		getMessage( '#cant-merge' );
		return false;
	} else if ( td == true && th == null) {
		var elm  = 'td';
	} else if ( td == null && th == true ) {
		elm = 'th';
	}

	$( elm + '.ui-selected' ).each(function() {
		if ( $( this ).hasClass( classMerged ) ) {
			$( '.ui-selected' ).removeClass( 'ui-selected' );
			getMessage( '#cant-remerge' );
			return false;
		}
	});

	var row = $row.val();
	var col = $col.val();

	var rowspan = $( elm + '.ui-selected' ).parent( 'tr' ).addClass( 'ui-selected' ).length;
	var colspan = $( elm + '.ui-selected' ).length / rowspan;

	if ( row == rowspan && col == colspan ) {
		$table.html( '<tr><'+ elm +'></'+ elm +'></tr>' );
	} else {
		if ( row != rowspan && col == colspan ) {
			if ( rowspan > 1 ) {
				$( 'tr.ui-selected:not( tr.ui-selected:first )' ).remove();
				rowspan = 1
			}
		} else if ( row == rowspan && col != colspan ) {
			if ( colspan > 1 ) {
				$wrapper.find( 'tr.ui-selected' ).each(function() {
					$( this ).children( elm + '.ui-selected:not( .ui-selected:first )' ).remove();
				});
				colspan = 1;
			}
		}

		var selectedRow = $( 'tr' ).index( $( 'tr.ui-selected:first' ) );
		var selectedFirst = $( elm ).index( $( elm + '.ui-selected:first' ) );

		if ( selectedFirst < col ) {
			var selected_col = selectedFirst;
		} else {
			var selected_col = selectedFirst - col * selectedRow ;
		}

		$( 'tr.ui-selected' ).each(function( i ) {
			if ( i == 0 ) {
				if ( colspan > 1 ) {
					$( this ).children( elm + '.ui-selected:not(.ui-selected:first)' ).remove();
				}
			} else {
				$( this ).children( elm + '.ui-selected' ).remove();
			}
		});

		if ( colspan > 1 ) {
			$( elm + '.ui-selected:first' ).attr( 'colspan', colspan ).addClass( classMerged );
		}

		if ( rowspan > 1 ) {
			$( elm + '.ui-selected:first' ).attr( 'rowspan', rowspan ).addClass( classMerged );
		}

		var empty = $( 'tr:empty' ).length;
		if ( empty > 0 ) {
			$wrapper.find( '[rowspan]' ).each(function( i ) {
				var rs = $( this ).attr( 'rowspan' ) - empty;
				$( this ).attr( 'rowspan', rs );
				if ( $( this ).attr( 'rowspan' ) == 1 ) $( this ).removeAttr( 'rowspan' );
			});
			$wrapper.find( 'tr:empty' ).remove();
			row = row - empty;
		}

		$( '.' + classMerged ).each(function() {
			if ( $( this ).attr( 'rowspan' ) === undefined && $( this ).attr( 'colspan' ) === undefined ) {
				$( this ).removeClass( classMerged );
			}
		});
	}
	generateTags( history() );
});

$( '#replace' ).click(function() {

	var selected = $wrapper.find( 'td.ui-selected, th.ui-selected' );

	if ( selected.length === 0 ) {
		getMessage( '#select-cells' );
	}

	selected.each(function() {
		var content = $( this ).text();
		var colspan = $( this ).attr( 'colspan' );
		var rowspan = $( this ).attr( 'rowspan' );
		var thisClass = $( this ).attr( 'class' );
		var elm = ($( this ).get(0).tagName.toLowerCase() == 'td' )? $( '<th>' ) : $( '<td>' );
		$( this ).replaceWith( function() {
			elm.text( content );
			if ( colspan ) {
				elm.attr( 'colspan', colspan );
			}
			if ( rowspan ) {
				elm.attr( 'rowspan', rowspan );
			}
			if ( thisClass ) {
				elm.addClass( thisClass ).removeClass( 'ui-selected' );
			}
			return elm;
		});
	});
	generateTags( history() );
});

$( '#split' ).click(function() {

	var selected = $wrapper.find( 'td.ui-selected, th.ui-selected' );

	if ( selected.length === 0 ) {
		getMessage( '#select-cells' );
	}

	splitCell();
	generateTags( history() );
});

$( '#undo' ).click(function() {
	if ( window.localStorage ) {
		var u = localStorage.getItem( 'undo' );

		u--;

		var o = JSON.parse( localStorage.getItem( 'o' + u ) );
		$row.val(o.row);
		$col.val(o.col);

		var data = localStorage.getItem( 'data' + u );

		$wrapper.empty().html( data );

		localStorage.setItem( 'undo' , u );
		generateTags( data );
		historyBtn();
		removeInput();
	}
});

$( '#redo' ).click(function() {
	if ( window.localStorage ) {
		var i = localStorage.getItem( 'index' );
		var u = localStorage.getItem( 'undo' );

		u++;

		var o = JSON.parse( localStorage.getItem( 'o'+u ) );
		$row.val(o.row);
		$col.val(o.col);

		var data = localStorage.getItem( 'data' + u );

		$wrapper.empty().html( data );

		localStorage.setItem( 'undo' , u );
		generateTags( data );
		historyBtn();
		removeInput();
	}
});

$( '#initialize' ).click(function() {
	generateTable( $row.val(), $col.val() );
	generateTags();

	if ( window.localStorage ) {
		localStorage.clear();
		localStorage.setItem( 'index', 0 );
		localStorage.setItem( 'undo', 0 );
		localStorage.setItem( 'o0', JSON.stringify({
			row : $row.val(),
			col : $col.val()
		}));
		localStorage.setItem( 'data0', $wrapper.html() );
	}

	removeInput();
	historyBtn();
});

$( '#insert' ).click(function() {
	var tags = $( '[name=source]', '#generator' ).val();
	$( '#content' ).insertAtCaret(tags);
	tb_remove()
});


// functions

$.fn.extend({
    insertAtCaret: function(v) {
      var o = this.get(0);
      o.focus();
      var s = o.value;
      var p = o.selectionStart;
      var np = p + v.length;
      o.value = s.substr(0, p) + v + s.substr(p);
      o.setSelectionRange(np, np);
    }
});

function isUA( arg ) {
  return new RegExp(arg, 'i' ).test(navigator.userAgent);
};

function generateTable( row, col ) {
	$wrapper.find( 'table' ).empty();
	var i, j, tr;
	for ( i = 0; i < row; i++ ) {
		tr = $( '<tr />' );
		for ( j = 0; j < col; j++ ) {
			$( '<td />' ).appendTo( tr );
		}
		tr.appendTo( $wrapper.find( 'table' ) );
	}
}

function eventHandler(event, delta) {
	var value, col, row;
	if ( delta < 0 ) {

		value = $( this ).val();
		$( this ).val( ++value );

		generateTable( $row.val(), $col.val() );
		generateTags( history() );

	} else if (delta > 0) {

		value = $( this ).val();
		--value;
		if ( value > 0 ) {
			$( this ).val( value );

			generateTable( $row.val(), $col.val() );
			generateTags( history() );
		}
	}
	removeInput();
	return false;
}

function history() {
	if ( window.localStorage ) {
		var i = localStorage.getItem( 'index' );
		var u = localStorage.getItem( 'undo' );
		var table = $wrapper.html();
		var o = {
			row : $row.val(),
			col : $col.val()
		};

		if ( i == u ) {
			i++;
			localStorage.setItem( 'data' + i, table );
			localStorage.setItem( 'o' + i, JSON.stringify(o) );
			localStorage.setItem( 'index', i );
			localStorage.setItem( 'undo', i );
		} else if ( i > u ) {
			u++;
			localStorage.setItem( 'data' + u, table );
			localStorage.setItem( 'o' + u, JSON.stringify(o) );
			localStorage.setItem( 'index', u );
			localStorage.setItem( 'undo', u );
		}

		historyBtn();
		return table;
	}
}

function historyBtn() {
	if ( window.localStorage ) {
		var i = Number( localStorage.getItem( 'index' ) );
		var u = Number( localStorage.getItem( 'undo' ) );

		// i 操作の回数
		// u undo 出来る回数
		// i-u redo 出来る回数

		// undo redo 不可    i == u && u == 0
		// undo 可 redo 不可 i == u && u != 0
		// undo redo 可      i > u && u != 0
		// undo 不可 redo 可 i > u && u == 0

		if ( i == u ) {
			if ( u == 0 ) {
				$( '#undo' ).attr( 'disabled', 'disabled' );
				$( '#redo' ).attr( 'disabled', 'disabled' );
			} else {
				$( '#undo' ).removeAttr( 'disabled' );
				$( '#redo' ).attr( 'disabled', 'disabled' );
			}
		} else {
			if ( u == 0 ) {
				$( '#undo' ).attr( 'disabled', 'disabled' );
				$( '#redo' ).removeAttr( 'disabled' );
			} else {
				$( '#undo' ).removeAttr( 'disabled' );
				$( '#redo' ).removeAttr( 'disabled' );
			}
		}
	}
}

function generateTags( data ) {
	var table;
	if ( !data ) {
		table = $wrapper.html();
	} else {
		table = data;
	}

	table = table
		.toLowerCase()
		.replace( /<\/table>/g, '\n</table>' )
		.replace( /&lt;/g, '<' )
		.replace( /&gt;/g, '>' )
		.replace( /ui-selecte(d\s|d)/g, '' )
		.replace( /ui-selecte(e\s|e)/g, '' )
		.replace( /ttg-merged/g, '' )
		.replace( / class=\"\"/g, '' )
		.replace( / class=\" \"/g, '' )
		.replace( / style=\".*?\"/g, '' )
		.replace( /<tb.*?>/g, '\n<tbody>' )
		.replace( /<\/tbo.*?>/g, '\n</tbody>' )
		.replace( /<tr/g, '\n<tr' )
		.replace( /<\/tr/g, '\n</tr' )
		.replace( /<td/g, '\n<td' )
		.replace( /<th/g, '\n<th' );
	if ( isUA( 'msie|trident' ) ) {
		table = table
		.replace( / class=>/g, '>' )
		.replace( /^\n/g, '' );
	}

	$( '[name=source]' ).val( '' ).val( table );
}

function splitCell() {
	$( '.ui-selected' + '.' + classMerged ).each(function() {
		var rowspan = Number( $( this ).attr( 'rowspan' ) );
		var colspan = Number( $( this ).attr( 'colspan' ) );
		if ( isNaN( colspan ) ) colspan = 1;

		$( this ).removeAttr( 'rowspan' );
		$( this ).removeAttr( 'colspan' );

		for ( i = 1; i < colspan; i++ ) {
			if ( $( this ).get(0).tagName.match( /td/i ) ) {
				var elm = $( '<td>' );
			} else if ( $( this ).get(0).tagName.match( /th/i ) ) {
				elm = $( '<th>' );
			}
			elm.addClass( 'ui-selected' );
			elm.insertAfter( $( this ) );
		}

		var tr = $( this ).parent( 'tr' ),
				index = $( 'tr' ).index( tr ),
				next = index + 1,
				col = Number( $col.val() );

		var prevElm = $( this ).parent().children().index( $( this ) ) - 1;

		var i, j, children;

		for ( i = next; i < next + rowspan - 1 ; i++ ) {
			children = $( 'tr:eq(' + i + ')' ).children();
			for ( j = 0; j < colspan; j++ ) {
				if ( $( this ).get( 0 ).tagName.match( /td/i ) ) {
					elm = $( '<td>' );
				} else if ( $( this ).get( 0 ).tagName.match( /th/i ) ) {
					elm = $( '<th>' );
				}
				elm.addClass( 'ui-selected' );
				if ( prevElm == -1 ) {
					elm.insertBefore( children[ 0 ] );
				} else {
					if ( children[ prevElm ] ) {
						elm.insertAfter( children[ prevElm ] );
					} else {
						elm.insertAfter( children[ children.length-1 ] );
					}
				}
			}
		}
		$( this ).removeClass( classMerged );
	});
}

function removeInput() {
	$wrapper.find( 'input' ).remove();
	$( '#stripe-label' ).remove();
}

function getMessage( selector ) {
	var selector = selector || '.default';

	clearTimeout( timer );

	$( '#generator .message p' ).hide();
	$( selector ).show();
	if ( $( selector ).hasClass( 'alert' ) ) {
		timer = setTimeout( function() {
			$( selector ).fadeOut( 'normal', function() {
				$( '.default' ).fadeIn();
			});
		}, 5000 );
	}
}

});