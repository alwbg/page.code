/**
 * @autor alwbg@163.com | soei
 * creation-time : 2018-04-12 14:28:42 PM
 */
;(function( global, factory ){
	global[ 'global' ] = global;
	if( typeof exports === 'object' ) {
		//factory( require, exports, module );
	} else if (typeof define === 'function') {
		//AMD CMD
		define( 'page.code', factory );
	} else {
		var funcName = 'require';
		if( funcName && !global[ funcName ] ) {
			global[ funcName ] = function( id ) {
				return global[id];
			};
		};
		var MODULE = { exports : {} };
		factory( global[ funcName ] || function( id ) {
			alert( '需要实现 require(),加载模块:"' + id + '"' );
		}, MODULE.exports, MODULE );
		global['page.code'] = MODULE.exports;
	}
}( this, function( require, exports, module ) {
	var Mode 	= require( 'mode' );
	var $er 	= require('event.runer');
	//页标开始
	var $$PAGE_MODE = new Mode('<div class="row-fluid" id="page-code"><div class="span6" style="width:20%"><div id="dataTable_info" class="dataTables_info">{?Math.min({count},({pageNum}-1)*{max} + 1)?} - {?Math.min({pageNum}*{max}, {count})?}  &nbsp;  共 {count} 条记录</div></div><div class="span6" style="width:77%;float:right"><div class="dataTables_paginate paging_bootstrap pagination"><ul>{?create_inner({this})?}</ul></div></div></div>');
	//当前页显示的左右偏移量
	$$PAGE_MODE.offset = 3;
	$$PAGE_MODE.$INNER = new Mode('{?module({this}, -1, {left});?}{?module({this});?}{?module({this}, 1, {right});?}' );
	// 上一页 center 下一页模板
	$$PAGE_MODE.$INNER.$simply = new Mode('<li id="Page-{?{_index}||{index}?}" class="{?{disabled}||""?} {?{cur}?"active disabled" : ""?} {?{clazz}||"";?}" event-handle="request" data-loading="true" data-uri="{?getURI()?}" args-i-max="{max}" args-i-page-num="{?{_index}||{index}?}" globel-i-page-num="true" globel-i-max="true" {?globalargs()?}><a {?{style}||"";?} href="javascript:;">{?{name}||{index}?}</a></li>');

	$$PAGE_MODE.$INNER.$simply.getURI = function(){
		return $er.get( 'current' ) || 'Need|To|Add|Attribute|--save-uri=true--';
	}
	var filters = /^(iMax|iPageNum)$/;

	var G_A_MODE = new Mode('args-{?js2css({name})?}="{value}" global-{?js2css({name})?}="true"');
	G_A_MODE.MAP = {};
	G_A_MODE.js2css = function( key ){
		return this.MAP[ key ] || ( this.MAP[ key ] = $er.js2css( key ) );
	}

	$$PAGE_MODE.$INNER.$simply.globalargs = function(){
		var cur = $er.current() || {};
		var ga = [], attr;
		for( var key in cur ){
			if( filters.test( key ) ) continue;
			ga.push( G_A_MODE.on( {name : key, value : cur[ key ]} ) );
		}
		return ga.join( ' ' );
	}
	$$PAGE_MODE.$INNER.module = function(self, offset, see){
		if( see ){
			self.name 	= '...';
			self._index = self.more - offset;
		} else {
			// 防止上一次修改了_index的值
			delete self._index;
			self.name = self.index;
		}
		if( offset == undefined ) see = true;
		return see ? this.$simply.on( self ) : '';
	}
	$$PAGE_MODE.PN = function( index, pn, count, max ){
		var name, clazz, isdisabled, page;
		if( pn > 0 ){
			clazz = 'next';
			name = 'Next → ';
			isdisabled = index == count || count == 0/*总数为0时右箭头不可用*/;
			page = Math.min( count, index + pn );
		} else {
			clazz = 'prev';
			name = '← Previous';
			isdisabled = index == 1;
			page = Math.max( 1, index + pn );
		}
		return this.$INNER.$simply.on({ clazz : clazz, disabled : isdisabled ? 'disabled' : '', name : name, index : page, max : max, pages : count });
	}
	$$PAGE_MODE.create_inner = function( self ){
		// API接口提供相应的参数
		// 每页显示数量
		var max 	= self.max;
		// 数据总量
		var count 	= self.count;
		// 当前索引
		var index 	= self.pageNum;
		// 计算总的页数
		var pages 	= Math.ceil( count / max );

		var pagehtml = '';
		
		var i = 0;
		// 当前左右显示位数
		var offset = this.offset || 3;
		offset = Math.min( offset, (pages / 2)>>0 );
		max = Math.min( offset * 2 + 1, pages );
		// 计算左偏移量
		var left = Math.min( index - 1, offset ) + offset - Math.min( offset, pages - index );
		// 计算总的显示 除去头尾外的长度
		// 计算开始值
		var start = Math.max( 1, index - left );
		// console.log('start:',start,'left:',left, 'max:', max,'index:', index,'pages:', pages,'offset:', offset);
		pagehtml += this.PN( index, -1, pages, self.max );
		// 首页编号及省略号现实逻辑
		if( start > 1 ) pagehtml += this.$INNER.on({ name : 1, max : self.max, index : 1, right: start > 2, more : start + i, style:'style="background-color:#eee"', pages : pages});
		// 中间编号显示逻辑
		for( ; i < max; i++ ){
			pagehtml += this.$INNER.on({ name : start + i, max : self.max, index : start + i, cur : index == start + i, pages : pages});
		}
		// 尾页编号及省略号的显示逻辑
		if( pages - start - max + 1 > 0 ) pagehtml += this.$INNER.on({ name : pages, max : self.max, index : pages, left: pages - start - max > 0, more : start + i -1, style:'style="background-color:#eee"', pages : pages  });

		pagehtml += this.PN( index, 1, pages, self.max );
		return pagehtml;
	}
	exports.run = function( json ){
		return $$PAGE_MODE.on( json );
	};

}));
