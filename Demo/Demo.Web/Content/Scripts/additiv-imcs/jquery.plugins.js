/*
 * Flexigrid for jQuery -  v1.1
 *
 * Copyright (c) 2008 Paulo P. Marinas (code.google.com/p/flexigrid/)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function ($) {
	/*!
     * START code from jQuery UI
     *
     * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
     * Dual licensed under the MIT or GPL Version 2 licenses.
     * http://jquery.org/license
     *
     * http://docs.jquery.com/UI
     */

	if (typeof $.support.selectstart != 'function') {
		$.support.selectstart = "onselectstart" in document.createElement("div");
	}

	if (typeof $.fn.disableSelection != 'function') {
		$.fn.disableSelection = function () {
			return this.bind(($.support.selectstart ? "selectstart" : "mousedown") +
                ".ui-disableSelection", function (event) {
                	event.preventDefault();
                });
		};
	}

	/* END code from jQuery UI */

	var flexiGridtranslations = additiv.imcs.translations['flexigrid'][$('html').attr('lang')];

	$.addFlex = function (t, p) {
		if (t.grid) return false; //return if already exist
		p = $.extend({ //apply default properties
			height: 200, //default height
			width: 'auto', //auto width
			striped: true, //apply odd even stripes
			novstripe: false,
			minwidth: 30, //min width of columns
			minheight: 80, //min height of columns
			resizable: true, //allow table resizing
			url: false, //URL if using data from AJAX
			detailUrl: false, //Detail URL if using data from AJAX
			method: 'POST', //data sending method
			dataType: 'xml', //type of data for AJAX, either xml or json
			detailDataType: 'html', //type of data for AJAX for detail view, either html or text
			errormsg: flexiGridtranslations.errormsg,
			usepager: false,
			nowrap: true,
			page: 1, //current page
			total: 1, //total pages
			useRp: true, //use the results per page select box
			rp: 15, //results per page
			rpOptions: [10, 15, 20, 30, 50], //allowed per-page values
			title: false,
			idProperty: 'id',
			pagestat: flexiGridtranslations.pagestat,
			pagetext: flexiGridtranslations.pagetext,
			outof: flexiGridtranslations.outof,
			findtext: flexiGridtranslations.findtext,
			params: [], //allow optional parameters to be passed around
			procmsg: flexiGridtranslations.procmsg,
			query: '',
			qtype: '',
			nomsg: flexiGridtranslations.nomsg,
			minColToggle: 1, //minimum allowed column to be hidden
			showToggleBtn: true, //show or hide column toggle popup
			hideOnSubmit: true,
			autoload: true,
			blockOpacity: 0.5,
			preProcess: false,
			addTitleToCell: false, // add a title attr to cells with truncated contents
			dblClickResize: false, //auto resize column by double clicking
			onDragCol: false,
			onToggleCol: false,
			onChangeSort: false,
			onDoubleClick: false,
			onSuccess: false,
			onError: false,
			onSubmit: false, //using a custom populate function
			__mw: { //extendable middleware function holding object
				datacol: function (p, col, val) { //middleware for formatting data columns
					var _col = (typeof p.datacol[col] == 'function') ? p.datacol[col](val) : val; //format column using function
					if (typeof p.datacol['*'] == 'function') { //if wildcard function exists
						return p.datacol['*'](_col); //run wildcard function
					} else {
						return _col; //return column without wildcard
					}
				}
			},
			getGridClass: function (g) { //get the grid class, always returns g
				return g;
			},
			datacol: {}, //datacol middleware object 'colkey': function(colval) {}
			colResize: true, //from: http://stackoverflow.com/a/10615589
			colMove: true
		}, p);
		$(t).show() //show if hidden
			.attr({
				cellPadding: 0,
				cellSpacing: 0,
				border: 0
			}) //remove padding and spacing
			.removeAttr('width'); //remove width properties
		//create grid class
		var g = {
			hset: {},
			rePosDrag: function () {
				var cdleft = 0 - this.hDiv.scrollLeft;
				if (this.hDiv.scrollLeft > 0) cdleft -= Math.floor(p.cgwidth / 2);
				$(g.cDrag).css({
					top: g.hDiv.offsetTop + 1
				});
				var cdpad = this.cdpad;
				var cdcounter = 0;
				$('div', g.cDrag).hide();
				$('thead tr:first th:visible', this.hDiv).each(function () {
					var n = $('thead tr:first th:visible', g.hDiv).index(this);
					var cdpos = parseInt($('div', this).width());
					if (cdleft == 0) cdleft -= Math.floor(p.cgwidth / 2);
					cdpos = cdpos + cdleft + cdpad;
					if (isNaN(cdpos)) {
						cdpos = 0;
					}
					$('div:eq(' + n + ')', g.cDrag).css({
						'left': (!($.browser.mozilla) ? cdpos - cdcounter : cdpos) + 'px'
					}).show();
					cdleft = cdpos;
					cdcounter++;
				});
			},
			fixHeight: function (newH) {
				newH = false;
				if (!newH) newH = $(g.bDiv).height();
				var hdHeight = $(this.hDiv).height();
				$('div', this.cDrag).each(
					function () {
						$(this).height(newH + hdHeight);
					}
				);
				var nd = parseInt($(g.nDiv).height(), 10);
				if (nd > newH) $(g.nDiv).height(newH).width(200);
				else $(g.nDiv).height('auto').width('auto');
				$(g.block).css({
					height: newH,
					marginBottom: (newH * -1)
				});
				var hrH = g.bDiv.offsetTop + newH;
				if (p.height != 'auto' && p.resizable) hrH = g.vDiv.offsetTop;
				$(g.rDiv).css({
					height: hrH
				});
			},
			dragStart: function (dragtype, e, obj) { //default drag function start
				if (dragtype == 'colresize' && p.colResize === true) {//column resize
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					var n = $('div', this.cDrag).index(obj);
					var ow = $('th:visible div:eq(' + n + ')', this.hDiv).width();
					$(obj).addClass('dragging').siblings().hide();
					$(obj).prev().addClass('dragging').show();
					this.colresize = {
						startX: e.pageX,
						ol: parseInt(obj.style.left, 10),
						ow: ow,
						n: n
					};
					$('body').css('cursor', 'col-resize');
				} else if (dragtype == 'vresize') {//table resize
					var hgo = false;
					$('body').css('cursor', 'row-resize');
					if (obj) {
						hgo = true;
						$('body').css('cursor', 'col-resize');
					}
					this.vresize = {
						h: p.height,
						sy: e.pageY,
						w: p.width,
						sx: e.pageX,
						hgo: hgo
					};
				} else if (dragtype == 'colMove') {//column header drag
					$(e.target).disableSelection(); //disable selecting the column header
					if ((p.colMove === true)) {
						$(g.nDiv).hide();
						$(g.nBtn).hide();
						this.hset = $(this.hDiv).offset();
						this.hset.right = this.hset.left + $('table', this.hDiv).width();
						this.hset.bottom = this.hset.top + $('table', this.hDiv).height();
						this.dcol = obj;
						this.dcoln = $('th', this.hDiv).index(obj);
						this.colCopy = document.createElement("div");
						this.colCopy.className = "colCopy";
						this.colCopy.innerHTML = obj.innerHTML;
						if ($.browser.msie) {
							this.colCopy.className = "colCopy ie";
						}
						$(this.colCopy).css({
							position: 'absolute',
							'float': 'left',
							display: 'none',
							textAlign: obj.align
						});
						$('body').append(this.colCopy);
						$(this.cDrag).hide();
					}
				}
				$('body').noSelect();
			},
			dragMove: function (e) {
				if (this.colresize) {//column resize
					var n = this.colresize.n;
					var diff = e.pageX - this.colresize.startX;
					var nleft = this.colresize.ol + diff;
					var nw = this.colresize.ow + diff;
					if (nw > p.minwidth) {
						$('div:eq(' + n + ')', this.cDrag).css('left', nleft);
						this.colresize.nw = nw;
					}
				} else if (this.vresize) {//table resize
					var v = this.vresize;
					var y = e.pageY;
					var diff = y - v.sy;
					if (!p.defwidth) p.defwidth = p.width;
					if (p.width != 'auto' && !p.nohresize && v.hgo) {
						var x = e.pageX;
						var xdiff = x - v.sx;
						var newW = v.w + xdiff;
						if (newW > p.defwidth) {
							this.gDiv.style.width = newW + 'px';
							p.width = newW;
						}
					}
					var newH = v.h + diff;
					if ((newH > p.minheight || p.height < p.minheight) && !v.hgo) {
						this.bDiv.style.height = newH + 'px';
						p.height = newH;
						this.fixHeight(newH);
					}
					v = null;
				} else if (this.colCopy) {
					$(this.dcol).addClass('thMove').removeClass('thOver');
					if (e.pageX > this.hset.right || e.pageX < this.hset.left || e.pageY > this.hset.bottom || e.pageY < this.hset.top) {
						//this.dragEnd();
						$('body').css('cursor', 'move');
					} else {
						$('body').css('cursor', 'pointer');
					}
					$(this.colCopy).css({
						top: e.pageY + 10,
						left: e.pageX + 20,
						display: 'block'
					});
				}
			},
			dragEnd: function () {
				if (this.colresize) {
					var n = this.colresize.n;
					var nw = this.colresize.nw;
					$('th:visible div:eq(' + n + ')', this.hDiv).css('width', nw);
					$('tr', this.bDiv).each(
						function () {
							var $tdDiv = $('td:visible div:eq(' + n + ')', this);
							$tdDiv.css('width', nw);
							g.addTitleToCell($tdDiv);
						}
					);
					this.hDiv.scrollLeft = this.bDiv.scrollLeft;
					$('div:eq(' + n + ')', this.cDrag).siblings().show();
					$('.dragging', this.cDrag).removeClass('dragging');
					this.rePosDrag();
					this.fixHeight();
					this.colresize = false;
					if ($.cookies) {
						var name = p.colModel[n].name;		// Store the widths in the cookies
						$.cookie('flexiwidths/' + name, nw);
					}
				} else if (this.vresize) {
					this.vresize = false;
				} else if (this.colCopy) {
					$(this.colCopy).remove();
					if (this.dcolt !== null) {
						if (this.dcoln > this.dcolt) $('th:eq(' + this.dcolt + ')', this.hDiv).before(this.dcol);
						else $('th:eq(' + this.dcolt + ')', this.hDiv).after(this.dcol);
						this.switchCol(this.dcoln, this.dcolt);
						$(this.cdropleft).remove();
						$(this.cdropright).remove();
						this.rePosDrag();
						if (p.onDragCol) {
							p.onDragCol(this.dcoln, this.dcolt);
						}
					}
					this.dcol = null;
					this.hset = null;
					this.dcoln = null;
					this.dcolt = null;
					this.colCopy = null;
					$('.thMove', this.hDiv).removeClass('thMove');
					$(this.cDrag).show();
				}
				$('body').css('cursor', 'default');
				$('body').noSelect(false);
			},
			toggleCol: function (cid, visible) {
				var ncol = $("th[axis='col" + cid + "']", this.hDiv)[0];
				var n = $('thead th', g.hDiv).index(ncol);
				var cb = $('input[value=' + cid + ']', g.nDiv)[0];
				if (visible == null) {
					visible = ncol.hidden;
				}
				if ($('input:checked', g.nDiv).length < p.minColToggle && !visible) {
					return false;
				}
				if (visible) {
					ncol.hidden = false;
					$(ncol).show();
					cb.checked = true;
				} else {
					ncol.hidden = true;
					$(ncol).hide();
					cb.checked = false;
				}
				$('tbody tr', t).each(
					function () {
						if (visible) {
							$('td:eq(' + n + ')', this).show();
						} else {
							$('td:eq(' + n + ')', this).hide();
						}
					}
				);
				this.rePosDrag();
				if (p.onToggleCol) {
					p.onToggleCol(cid, visible);
				}
				return visible;
			},
			switchCol: function (cdrag, cdrop) { //switch columns
				$('tbody tr', t).each(
					function () {
						if (cdrag > cdrop) $('td:eq(' + cdrop + ')', this).before($('td:eq(' + cdrag + ')', this));
						else $('td:eq(' + cdrop + ')', this).after($('td:eq(' + cdrag + ')', this));
					}
				);
				//switch order in nDiv
				if (cdrag > cdrop) {
					$('tr:eq(' + cdrop + ')', this.nDiv).before($('tr:eq(' + cdrag + ')', this.nDiv));
				} else {
					$('tr:eq(' + cdrop + ')', this.nDiv).after($('tr:eq(' + cdrag + ')', this.nDiv));
				}
				if ($.browser.msie && $.browser.version < 7.0) {
					$('tr:eq(' + cdrop + ') input', this.nDiv)[0].checked = true;
				}
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
			},
			scroll: function () {
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				this.rePosDrag();
			},
			addDetailData: function (row, data) { //parse detail data
				$('.pRight', $(row)).toggleClass('pDown');
				var cs = p.colModel.length + 1;
				$(row).after('<tr class="detail"><td colspan="' + cs + '">' + data + "</td></tr>");
			},
			addData: function (data) { //parse data
				if (p.dataType == 'json') {
					data = $.extend({ rows: [], page: 0, total: 0 }, data);
				}
				if (p.preProcess) {
					data = p.preProcess(data);
				}
				$('.pReload', this.pDiv).removeClass('loading');
				this.loading = false;
				if (!data) {
					$('.pPageStat', this.pDiv).html(p.errormsg);
					if (p.onSuccess) p.onSuccess(this);
					return false;
				}
				if (p.dataType == 'xml') {
					p.total = +$('rows total', data).text();
				} else {
					p.total = data.total;
				}
				if (p.total === 0) {
					$('tr, a, td, div', t).unbind();
					$(t).empty();
					p.pages = 1;
					p.page = 1;
					this.buildpager();
					$('.pPageStat', this.pDiv).html(p.nomsg);
					if (p.onSuccess) p.onSuccess(this);
					return false;
				}
				p.pages = Math.ceil(p.total / p.rp);
				if (p.dataType == 'xml') {
					p.page = +$('rows page', data).text();
				} else {
					p.page = data.page;
				}
				this.buildpager();
				//build new body
				var tbody = document.createElement('tbody');
				//shift data if fixed row is used
				var shift = (p.detailUrl ? -1 : 0);
				if (p.dataType == 'json') {
					$.each(data.rows, function (i, row) {
						var tr = document.createElement('tr');
						var jtr = $(tr);
						if (row.name) tr.name = row.name;
						if (row.color) {
							jtr.css('background', row.color);
						} else {
							if (i % 2 && p.striped) tr.className = 'erow';
						}
						if (row[p.idProperty]) {
							tr.id = 'row' + row[p.idProperty];
							jtr.attr('data-id', row[p.idProperty]);
						}
						$('thead tr:first th[fixed]', g.hDiv).each(//add fixed cell
							function () {
								var td = document.createElement('td');
								$(td).addClass("pRight");
								td.align = this.align;
								$(tr).append(td);
								td = null;
							}
						);

						$('thead tr:first th:not([fixed])', g.hDiv).each( //add cell
							function () {
								var td = document.createElement('td');
								var idx = parseInt($(this).attr('axis').substr(3), 10);
								idx = idx + shift;
								td.align = this.align;
								// If each row is the object itself (no 'cell' key)
								if (typeof row.cell == 'undefined') {
									td.innerHTML = row[p.colModel[idx].name];
								} else {
									// If the json elements aren't named (which is typical), use numeric order
									var iHTML = '';
									if (typeof row.cell[idx] != "undefined") {
										iHTML = (row.cell[idx] !== null) ? row.cell[idx] : ''; //null-check for Opera-browser
									} else {
										iHTML = row.cell[p.colModel[idx].name];
									}
									td.innerHTML = p.__mw.datacol(p, $(this).attr('abbr'), iHTML); //use middleware datacol to format cols
								}
								// If the content has a <BGCOLOR=nnnnnn> option, decode it.
								var offs = td.innerHTML.indexOf('<BGCOLOR=');
								if (offs > 0) {
									$(td).css('background', text.substr(offs + 7, 7));
								}

								$(td).attr('abbr', $(this).attr('abbr'));
								$(tr).append(td);
								td = null;
							}
						);
						if ($('thead', this.gDiv).length < 1) {//handle if grid has no headers
							if (p.detailUrl) {
								var td = document.createElement('td');
								$(td).addClass("pRight");
								$(tr).append(td);
							}
							for (idx = 0; idx < cell.length; idx++) {
								var td = document.createElement('td');
								// If the json elements aren't named (which is typical), use numeric order
								if (typeof row.cell[idx] != "undefined") {
									td.innerHTML = (row.cell[idx] != null) ? row.cell[idx] : '';//null-check for Opera-browser
								} else {
									td.innerHTML = row.cell[p.colModel[idx].name];
								}
								$(tr).append(td);
								td = null;
							}
						}
						$(tbody).append(tr);
						tr = null;
					});
				} else if (p.dataType == 'xml') {
					var i = 1;
					$("rows row", data).each(function () {
						i++;
						var tr = document.createElement('tr');
						if ($(this).attr('name')) tr.name = $(this).attr('name');
						if ($(this).attr('color')) {
							$(tr).css('background', $(this).attr('id'));
						} else {
							if (i % 2 && p.striped) tr.className = 'erow';
						}
						var nid = $(this).attr('id');
						if (nid) {
							tr.id = 'row' + nid;
						}
						nid = null;
						var robj = this;
						$('thead tr:first th[fixed]', g.hDiv).each(
                             function () {
                             	var td = document.createElement('td');
                             	$(td).addClass("pRight");
                             	td.align = this.align;
                             	$(tr).append(td);
                             	td = null;
                             }
                        );
						$('thead tr:first th:not([fixed])', g.hDiv).each(function () {
							var td = document.createElement('td');
							var idx = parseInt($(this).attr('axis').substr(3), 10);
							idx = idx + shift;
							td.align = this.align;

							var text = $("cell:eq(" + idx + ")", robj).text();
							var offs = text.indexOf('<BGCOLOR=');
							if (offs > 0) {
								$(td).css('background', text.substr(offs + 7, 7));
							}
							td.innerHTML = p.__mw.datacol(p, $(this).attr('abbr'), text); //use middleware datacol to format cols
							$(td).attr('abbr', $(this).attr('abbr'));
							$(tr).append(td);
							td = null;
						});
						if ($('thead', this.gDiv).length < 1) {//handle if grid has no headers
							if (p.detailUrl) {
								var td = document.createElement('td');
								$(td).addClass("pRight");
								$(tr).append(td);
							}
							$('cell', this).each(function () {
								var td = document.createElement('td');
								td.innerHTML = $(this).text();
								$(tr).append(td);
								td = null;
							});
						}
						$(tbody).append(tr);
						tr = null;
						robj = null;
					});
				}
				$('tr', t).unbind();
				$(t).empty();
				$(t).append(tbody);
				this.addCellProp();
				this.addRowProp();
				this.rePosDrag();
				tbody = null;
				data = null;
				i = null;
				if (p.onSuccess) {
					p.onSuccess(this);
				}
				if (p.detailUrl) {
					$('.pRight', g.bDiv).click(function () {
						var row = $(this).closest('tr', $(t));
						var dr = $(row).next();
						if ($(dr).hasClass("detail")) {
							$('.pRight', $(row)).toggleClass('pDown');
							if ($(dr).is(":visible"))
								$(dr).hide();
							else
								$(dr).show();
						} else {
							var value = $(row).attr('id').substr(3);
							$.ajax({
								type: p.method,
								url: p.detailUrl,
								data: [{ name: 'id', value: value }],
								dataType: p.detailDataType,
								success: function (data) {
									g.addDetailData(row, data);
								},
								error: function (XMLHttpRequest, textStatus, errorThrown) {
									try {
										if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
									} catch (e) {
									}
								}
							});
						}
					});
				}
				if (p.hideOnSubmit) {
					$(g.block).remove();
				}
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				if ($.browser.opera) {
					$(t).css('visibility', 'visible');
				}
			},
			changeSort: function (th) { //change sortorder
				if (this.loading) {
					return true;
				}
				$(g.nDiv).hide();
				$(g.nBtn).hide();
				if (p.sortname == $(th).attr('abbr')) {
					if (p.sortorder == 'asc') {
						p.sortorder = 'desc';
					} else {
						p.sortorder = 'asc';
					}
				}
				$(th).addClass('sorted').siblings().removeClass('sorted');
				$('.sdesc', this.hDiv).removeClass('sdesc');
				$('.sasc', this.hDiv).removeClass('sasc');
				$('div', th).addClass('s' + p.sortorder);
				p.sortname = $(th).attr('abbr');
				if (p.onChangeSort) {
					p.onChangeSort(p.sortname, p.sortorder);
				} else {
					this.populate();
				}
			},
			buildpager: function () { //rebuild pager based on new properties
				$('.pcontrol input', this.pDiv).val(p.page);
				$('.pcontrol span', this.pDiv).html(p.pages);
				var r1 = p.total == 0 ? 0 : (p.page - 1) * p.rp + 1;
				var r2 = r1 + p.rp - 1;
				if (p.total < r2) {
					r2 = p.total;
				}
				var stat = p.pagestat;
				stat = stat.replace(/{from}/, r1);
				stat = stat.replace(/{to}/, r2);
				stat = stat.replace(/{total}/, p.total);
				$('.pPageStat', this.pDiv).html(stat);
			},
			populate: function () { //get latest data
				if (this.loading) {
					return true;
				}
				if (p.onSubmit) {
					var gh = p.onSubmit();
					if (!gh) {
						return false;
					}
				}
				this.loading = true;
				if (!p.url) {
					return false;
				}
				$('.pPageStat', this.pDiv).html(p.procmsg);
				$('.pReload', this.pDiv).addClass('loading');
				$(g.block).css({
					top: g.bDiv.offsetTop
				});
				if (p.hideOnSubmit) {
					$(this.gDiv).prepend(g.block);
				}
				if ($.browser.opera) {
					$(t).css('visibility', 'hidden');
				}
				if (!p.newp) {
					p.newp = 1;
				}
				if (p.page > p.pages) {
					p.page = p.pages;
				}
				var param = [{
					name: 'page',
					value: p.newp
				}, {
					name: 'rp',
					value: p.rp
				}, {
					name: 'sortname',
					value: p.sortname
				}, {
					name: 'sortorder',
					value: p.sortorder
				}, {
					name: 'query',
					value: p.query
				}, {
					name: 'qtype',
					value: p.qtype
				}];
				if (p.params.length) {
					for (var pi = 0; pi < p.params.length; pi++) {
						param[param.length] = p.params[pi];
					}
				}
				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					dataType: p.dataType,
					success: function (data) {
						g.addData(data);
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						try {
							if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
						} catch (e) { }
					}
				});
			},
			doSearch: function () {
				p.query = $('input[name=q]', g.sDiv).val();
				p.qtype = $('select[name=qtype]', g.sDiv).val();
				p.newp = 1;
				this.populate();
			},
			changePage: function (ctype) { //change page
				if (this.loading) {
					return true;
				}
				switch (ctype) {
					case 'first':
						p.newp = 1;
						break;
					case 'prev':
						if (p.page > 1) {
							p.newp = parseInt(p.page, 10) - 1;
						}
						break;
					case 'next':
						if (p.page < p.pages) {
							p.newp = parseInt(p.page, 10) + 1;
						}
						break;
					case 'last':
						p.newp = p.pages;
						break;
					case 'input':
						var nv = parseInt($('.pcontrol input', this.pDiv).val(), 10);
						if (isNaN(nv)) {
							nv = 1;
						}
						if (nv < 1) {
							nv = 1;
						} else if (nv > p.pages) {
							nv = p.pages;
						}
						$('.pcontrol input', this.pDiv).val(nv);
						p.newp = nv;
						break;
				}
				if (p.newp == p.page) {
					return false;
				}
				if (p.onChangePage) {
					p.onChangePage(p.newp);
				} else {
					this.populate();
				}
			},
			addCellProp: function () {
				$('tbody tr td', g.bDiv).each(function () {
					var tdDiv = document.createElement('div');
					var n = $('td', $(this).parent()).index(this);
					var pth = $('th:eq(' + n + ')', g.hDiv).get(0);
					if (pth != null) {
						if (p.sortname == $(pth).attr('abbr') && p.sortname) {
							this.className = 'sorted';
						}
						$(tdDiv).css({
							textAlign: pth.align,
							width: $('div:first', pth)[0].style.width
						});
						if (pth.hidden) {
							$(this).css('display', 'none');
						}
					}
					if (p.nowrap == false) {
						$(tdDiv).css('white-space', 'normal');
					}
					if (this.innerHTML == '') {
						this.innerHTML = '&nbsp;';
					}
					tdDiv.innerHTML = this.innerHTML;
					var prnt = $(this).parent()[0];
					var pid = false;
					if (prnt.id) {
						pid = prnt.id.substr(3);
					}
					if (pth != null) {
						if (pth.process) pth.process(tdDiv, pid);
					}
					$(this).empty().append(tdDiv).removeAttr('width'); //wrap content
					g.addTitleToCell(tdDiv);
				});
			},
			getCellDim: function (obj) {// get cell prop for editable event
				var ht = parseInt($(obj).height(), 10);
				var pht = parseInt($(obj).parent().height(), 10);
				var wt = parseInt(obj.style.width, 10);
				var pwt = parseInt($(obj).parent().width(), 10);
				var top = obj.offsetParent.offsetTop;
				var left = obj.offsetParent.offsetLeft;
				var pdl = parseInt($(obj).css('paddingLeft'), 10);
				var pdt = parseInt($(obj).css('paddingTop'), 10);
				return {
					ht: ht,
					wt: wt,
					top: top,
					left: left,
					pdl: pdl,
					pdt: pdt,
					pht: pht,
					pwt: pwt
				};
			},
			addRowProp: function () {
				$('tbody tr', g.bDiv).on('click', function (e) {
					var obj = (e.target || e.srcElement);
					if (obj.href || obj.type) return true;
					if (e.ctrlKey || e.metaKey) {
						// mousedown already took care of this case
						return;
					}
					$(this).toggleClass('trSelected');
					if (p.singleSelect && !g.multisel) {
						$(this).siblings().removeClass('trSelected');
					}
				}).on('mousedown', function (e) {
					if (e.shiftKey) {
						$(this).toggleClass('trSelected');
						g.multisel = true;
						this.focus();
						$(g.gDiv).noSelect();
					}
					if (e.ctrlKey || e.metaKey) {
						$(this).toggleClass('trSelected');
						g.multisel = true;
						this.focus();
					}
				}).on('mouseup', function (e) {
					if (g.multisel && !(e.ctrlKey || e.metaKey)) {
						g.multisel = false;
						$(g.gDiv).noSelect(false);
					}
				}).on('dblclick', function () {
					if (p.onDoubleClick) {
						p.onDoubleClick(this, g, p);
					}
				}).hover(function (e) {
					if (g.multisel && e.shiftKey) {
						$(this).toggleClass('trSelected');
					}
				}, function () { });
				if ($.browser.msie && $.browser.version < 7.0) {
					$(this).hover(function () {
						$(this).addClass('trOver');
					}, function () {
						$(this).removeClass('trOver');
					});
				}
			},

			combo_flag: true,
			combo_resetIndex: function (selObj) {
				if (this.combo_flag) {
					selObj.selectedIndex = 0;
				}
				this.combo_flag = true;
			},
			combo_doSelectAction: function (selObj) {
				eval(selObj.options[selObj.selectedIndex].value);
				selObj.selectedIndex = 0;
				this.combo_flag = false;
			},
			//Add title attribute to div if cell contents is truncated
			addTitleToCell: function (tdDiv) {
				if (p.addTitleToCell) {
					var $span = $('<span />').css('display', 'none'),
						$div = (tdDiv instanceof jQuery) ? tdDiv : $(tdDiv),
						div_w = $div.outerWidth(),
						span_w = 0;

					$('body').children(':first').before($span);
					$span.html($div.html());
					$span.css('font-size', '' + $div.css('font-size'));
					$span.css('padding-left', '' + $div.css('padding-left'));
					span_w = $span.innerWidth();
					$span.remove();

					if (span_w > div_w) {
						$div.attr('title', $div.text());
					} else {
						$div.removeAttr('title');
					}
				}
			},
			autoResizeColumn: function (obj) {
				if (!p.dblClickResize) {
					return;
				}
				var n = $('div', this.cDrag).index(obj),
					$th = $('th:visible div:eq(' + n + ')', this.hDiv),
					ol = parseInt(obj.style.left, 10),
					ow = $th.width(),
					nw = 0,
					nl = 0,
					$span = $('<span />');
				$('body').children(':first').before($span);
				$span.html($th.html());
				$span.css('font-size', '' + $th.css('font-size'));
				$span.css('padding-left', '' + $th.css('padding-left'));
				$span.css('padding-right', '' + $th.css('padding-right'));
				nw = $span.width();
				$('tr', this.bDiv).each(function () {
					var $tdDiv = $('td:visible div:eq(' + n + ')', this),
						spanW = 0;
					$span.html($tdDiv.html());
					$span.css('font-size', '' + $tdDiv.css('font-size'));
					$span.css('padding-left', '' + $tdDiv.css('padding-left'));
					$span.css('padding-right', '' + $tdDiv.css('padding-right'));
					spanW = $span.width();
					nw = (spanW > nw) ? spanW : nw;
				});
				$span.remove();
				nw = (p.minWidth > nw) ? p.minWidth : nw;
				nl = ol + (nw - ow);
				$('div:eq(' + n + ')', this.cDrag).css('left', nl);
				this.colresize = {
					nw: nw,
					n: n
				};
				g.dragEnd();
			},
			pager: 0
		};

		g = p.getGridClass(g); //get the grid class

		if (p.colModel) { //create model if any
			thead = document.createElement('thead');
			var tr = document.createElement('tr');
			if (p.detailUrl) {
				var cm = new Object();
				cm.display = "";
				cm.width = 25;
				cm.align = 'left';
				cm.fixed = true;
				p.colModel.splice(0, 0, cm);
			}
			for (var i = 0; i < p.colModel.length; i++) {
				var cm = p.colModel[i];
				var th = document.createElement('th');
				$(th).attr('axis', 'col' + i);
				if (cm) {	// only use cm if its defined
					if ($.cookies) {
						var cookie_width = 'flexiwidths/' + cm.name;		// Re-Store the widths in the cookies
						if ($.cookie(cookie_width) != undefined) {
							cm.width = $.cookie(cookie_width);
						}
					}
					if (cm.display != undefined) {
						th.innerHTML = cm.display;
					}
					if (cm.name && cm.sortable) {
						$(th).attr('abbr', cm.name);
					}
					if (cm.align) {
						th.align = cm.align;
					}
					if (cm.width) {
						$(th).attr('width', cm.width);
					}
					if ($(cm).attr('hide')) {
						th.hidden = true;
					}
					if (cm.process) {
						th.process = cm.process;
					}
					if (cm.fixed) {
						$(th).attr('fixed', "true");
					}
				} else {
					th.innerHTML = "";
					$(th).attr('width', 30);
				}
				$(tr).append(th);
			}
			$(thead).append(tr);
			$(t).prepend(thead);
		} // end if p.colmodel
		//init divs
		g.gDiv = document.createElement('div'); //create global container
		g.mDiv = document.createElement('div'); //create title container
		g.hDiv = document.createElement('div'); //create header container
		g.bDiv = document.createElement('div'); //create body container
		g.vDiv = document.createElement('div'); //create grip
		g.rDiv = document.createElement('div'); //create horizontal resizer
		g.cDrag = document.createElement('div'); //create column drag
		g.block = document.createElement('div'); //creat blocker
		g.nDiv = document.createElement('div'); //create column show/hide popup
		g.nBtn = document.createElement('div'); //create column show/hide button
		g.iDiv = document.createElement('div'); //create editable layer
		g.tDiv = document.createElement('div'); //create toolbar
		g.sDiv = document.createElement('div');
		g.pDiv = document.createElement('div'); //create pager container

		if (p.colResize === false) { //don't display column drag if we are not using it
			$(g.cDrag).css('display', 'none');
		}

		if (!p.usepager) {
			g.pDiv.style.display = 'none';
		}
		g.hTable = document.createElement('table');
		g.gDiv.className = 'flexigrid';
		if (p.width != 'auto') {
			g.gDiv.style.width = p.width + isNaN(p.width) ? '' : 'px';
		}
		//add conditional classes
		if ($.browser.msie) {
			$(g.gDiv).addClass('ie');
		}
		if (p.novstripe) {
			$(g.gDiv).addClass('novstripe');
		}
		$(t).before(g.gDiv);
		$(g.gDiv).append(t);
		//set toolbar
		if (p.buttons) {
			g.tDiv.className = 'tDiv';
			var tDiv2 = document.createElement('div');
			tDiv2.className = 'tDiv2';
			for (var i = 0; i < p.buttons.length; i++) {
				var btn = p.buttons[i];
				if (!btn.separator) {
					var btnDiv = document.createElement('div');
					btnDiv.className = 'fbutton';
					btnDiv.innerHTML = ("<div><span>") + (btn.hidename ? "&nbsp;" : btn.name) + ("</span></div>");
					if (btn.bclass) $('span', btnDiv).addClass(btn.bclass).css({
						paddingLeft: 20
					});
					if (btn.bimage) // if bimage defined, use its string as an image url for this buttons style (RS)
						$('span', btnDiv).css('background', 'url(' + btn.bimage + ') no-repeat center left');
					$('span', btnDiv).css('paddingLeft', 20);

					if (btn.tooltip) // add title if exists (RS)
						$('span', btnDiv)[0].title = btn.tooltip;

					btnDiv.onpress = btn.onpress;
					btnDiv.name = btn.name;
					if (btn.id) {
						btnDiv.id = btn.id;
					}
					if (btn.onpress) {
						$(btnDiv).click(function () {
							this.onpress(this.id || this.name, g.gDiv);
						});
					}
					$(tDiv2).append(btnDiv);
					if ($.browser.msie && $.browser.version < 7.0) {
						$(btnDiv).hover(function () {
							$(this).addClass('fbOver');
						}, function () {
							$(this).removeClass('fbOver');
						});
					}
				} else {
					$(tDiv2).append("<div class='btnseparator'></div>");
				}
			}
			$(g.tDiv).append(tDiv2);
			$(g.tDiv).append("<div style='clear:both'></div>");
			$(g.gDiv).prepend(g.tDiv);
		}
		g.hDiv.className = 'hDiv';

		// Define a combo button set with custom action'ed calls when clicked.
		if (p.combobuttons && $(g.tDiv2)) {
			var btnDiv = document.createElement('div');
			btnDiv.className = 'fbutton';

			var tSelect = document.createElement('select');
			$(tSelect).change(function () { g.combo_doSelectAction(tSelect) });
			$(tSelect).click(function () { g.combo_resetIndex(tSelect) });
			tSelect.className = 'cselect';
			$(btnDiv).append(tSelect);

			for (i = 0; i < p.combobuttons.length; i++) {
				var btn = p.combobuttons[i];
				if (!btn.separator) {
					var btnOpt = document.createElement('option');
					btnOpt.innerHTML = btn.name;

					if (btn.bclass)
						$(btnOpt)
						.addClass(btn.bclass)
						.css({ paddingLeft: 20 })
					;
					if (btn.bimage)  // if bimage defined, use its string as an image url for this buttons style (RS)
						$(btnOpt).css('background', 'url(' + btn.bimage + ') no-repeat center left');
					$(btnOpt).css('paddingLeft', 20);

					if (btn.tooltip) // add title if exists (RS)
						$(btnOpt)[0].title = btn.tooltip;

					if (btn.onpress) {
						btnOpt.value = btn.onpress;
					}
					$(tSelect).append(btnOpt);
				}
			}
			$('.tDiv2').append(btnDiv);
		}


		$(t).before(g.hDiv);
		g.hTable.cellPadding = 0;
		g.hTable.cellSpacing = 0;
		$(g.hDiv).append('<div class="hDivBox"></div>');
		$('div', g.hDiv).append(g.hTable);
		var thead = $("thead:first", t).get(0);
		if (thead) $(g.hTable).append(thead);
		thead = null;
		if (!p.colmodel) var ci = 0;
		$('thead tr:first th', g.hDiv).each(function () {
			var thdiv = document.createElement('div');
			if ($(this).attr('abbr')) {
				$(this).click(function (e) {
					if (!$(this).hasClass('thOver')) return false;
					var obj = (e.target || e.srcElement);
					if (obj.href || obj.type) return true;
					g.changeSort(this);
				});
				if ($(this).attr('abbr') == p.sortname) {
					this.className = 'sorted';
					thdiv.className = 's' + p.sortorder;
				}
			}
			if (this.hidden) {
				$(this).hide();
			}
			if (!p.colmodel) {
				$(this).attr('axis', 'col' + ci++);
			}
			$(thdiv).css({
				textAlign: this.align,
				width: this.width + 'px'
			});
			thdiv.innerHTML = this.innerHTML;
			$(this).empty().append(thdiv).removeAttr('width').mousedown(function (e) {
				g.dragStart('colMove', e, this);
			}).hover(function () {
				if (!g.colresize && !$(this).hasClass('thMove') && !g.colCopy) {
					if (!$(this).attr("fixed")) $(this).addClass('thOver');
				}
				if ($(this).attr('abbr') != p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
					$('div', this).addClass('s' + p.sortorder);
				} else if ($(this).attr('abbr') == p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
					var no = (p.sortorder == 'asc') ? 'desc' : 'asc';
					$('div', this).removeClass('s' + p.sortorder).addClass('s' + no);
				}
				if (g.colCopy) {
					var n = $('th', g.hDiv).index(this);
					if (n == g.dcoln) {
						return false;
					}
					if (n < g.dcoln) {
						$(this).append(g.cdropleft);
					} else {
						$(this).append(g.cdropright);
					}
					g.dcolt = n;
				} else if (!g.colresize) {
					var nv = $('th:visible', g.hDiv).index(this);
					var onl = parseInt($('div:eq(' + nv + ')', g.cDrag).css('left'), 10);
					var nw = jQuery(g.nBtn).outerWidth();
					var nl = onl - nw + Math.floor(p.cgwidth / 2);
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					if (!$(this).attr('fixed'))
						$(g.nBtn).css({
							'left': nl,
							top: g.hDiv.offsetTop
						}).show();
					var ndw = parseInt($(g.nDiv).width(), 10);
					$(g.nDiv).css({
						top: g.bDiv.offsetTop
					});
					if ((nl + ndw) > $(g.gDiv).width()) {
						$(g.nDiv).css('left', onl - ndw + 1);
					} else {
						$(g.nDiv).css('left', nl);
					}
					if ($(this).hasClass('sorted')) {
						$(g.nBtn).addClass('srtd');
					} else {
						$(g.nBtn).removeClass('srtd');
					}
				}
			}, function () {
				$(this).removeClass('thOver');
				if ($(this).attr('abbr') != p.sortname) {
					$('div', this).removeClass('s' + p.sortorder);
				} else if ($(this).attr('abbr') == p.sortname) {
					var no = (p.sortorder == 'asc') ? 'desc' : 'asc';
					$('div', this).addClass('s' + p.sortorder).removeClass('s' + no);
				}
				if (g.colCopy) {
					$(g.cdropleft).remove();
					$(g.cdropright).remove();
					g.dcolt = null;
				}
			}); //wrap content
		});
		//set bDiv
		g.bDiv.className = 'bDiv';
		$(t).before(g.bDiv);
		$(g.bDiv).css({
			height: (p.height == 'auto') ? 'auto' : p.height + "px"
		}).scroll(function (e) {
			g.scroll()
		}).append(t);
		if (p.height == 'auto') {
			$('table', g.bDiv).addClass('autoht');
		}
		//add td & row properties
		g.addCellProp();
		g.addRowProp();
		//set cDrag only if we are using it
		if (p.colResize === true) {
			var cdcol = $('thead tr:first th:first', g.hDiv).get(0);
			if (cdcol !== null) {
				g.cDrag.className = 'cDrag';
				g.cdpad = 0;
				g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderLeftWidth'), 10)) ? 0 : parseInt($('div', cdcol).css('borderLeftWidth'), 10));
				g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderRightWidth'), 10)) ? 0 : parseInt($('div', cdcol).css('borderRightWidth'), 10));
				g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingLeft'), 10)) ? 0 : parseInt($('div', cdcol).css('paddingLeft'), 10));
				g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingRight'), 10)) ? 0 : parseInt($('div', cdcol).css('paddingRight'), 10));
				g.cdpad += (isNaN(parseInt($(cdcol).css('borderLeftWidth'), 10)) ? 0 : parseInt($(cdcol).css('borderLeftWidth'), 10));
				g.cdpad += (isNaN(parseInt($(cdcol).css('borderRightWidth'), 10)) ? 0 : parseInt($(cdcol).css('borderRightWidth'), 10));
				g.cdpad += (isNaN(parseInt($(cdcol).css('paddingLeft'), 10)) ? 0 : parseInt($(cdcol).css('paddingLeft'), 10));
				g.cdpad += (isNaN(parseInt($(cdcol).css('paddingRight'), 10)) ? 0 : parseInt($(cdcol).css('paddingRight'), 10));
				$(g.bDiv).before(g.cDrag);
				var cdheight = $(g.bDiv).height();
				var hdheight = $(g.hDiv).height();
				$(g.cDrag).css({
					top: -hdheight + 'px'
				});
				$('thead tr:first th', g.hDiv).each(function () {
					var cgDiv = document.createElement('div');
					$(g.cDrag).append(cgDiv);
					if (!p.cgwidth) {
						p.cgwidth = $(cgDiv).width();
					}
					$(cgDiv).css({
						height: cdheight + hdheight
					}).mousedown(function (e) {
						g.dragStart('colresize', e, this);
					}).dblclick(function (e) {
						g.autoResizeColumn(this);
					});
					if ($.browser.msie && $.browser.version < 7.0) {
						g.fixHeight($(g.gDiv).height());
						$(cgDiv).hover(function () {
							g.fixHeight();
							$(this).addClass('dragging');
						}, function () {
							if (!g.colresize) {
								$(this).removeClass('dragging');
							}
						});
					}
				});
			}
		}
		//add strip
		if (p.striped) {
			$('tbody tr:odd', g.bDiv).addClass('erow');
		}
		if (p.resizable && p.height != 'auto') {
			g.vDiv.className = 'vGrip';
			$(g.vDiv).mousedown(function (e) {
				g.dragStart('vresize', e);
			}).html('<span></span>');
			$(g.bDiv).after(g.vDiv);
		}
		if (p.resizable && p.width != 'auto' && !p.nohresize) {
			g.rDiv.className = 'hGrip';
			$(g.rDiv).mousedown(function (e) {
				g.dragStart('vresize', e, true);
			}).html('<span></span>').css('height', $(g.gDiv).height());
			if ($.browser.msie && $.browser.version < 7.0) {
				$(g.rDiv).hover(function () {
					$(this).addClass('hgOver');
				}, function () {
					$(this).removeClass('hgOver');
				});
			}
			$(g.gDiv).append(g.rDiv);
		}
		// add pager
		if (p.usepager) {
			g.pDiv.className = 'pDiv';
			g.pDiv.innerHTML = '<div class="pDiv2"></div>';
			$(g.bDiv).after(g.pDiv);
			var html = ' <div class="pGroup"> <div class="pFirst pButton"><span></span></div><div class="pPrev pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pcontrol">' + p.pagetext + ' <input type="text" size="4" value="1" /> ' + p.outof + ' <span> 1 </span></span></div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pNext pButton"><span></span></div><div class="pLast pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pReload pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pPageStat"></span></div>';
			$('div', g.pDiv).html(html);
			$('.pReload', g.pDiv).click(function () {
				g.populate();
			});
			$('.pFirst', g.pDiv).click(function () {
				g.changePage('first');
			});
			$('.pPrev', g.pDiv).click(function () {
				g.changePage('prev');
			});
			$('.pNext', g.pDiv).click(function () {
				g.changePage('next');
			});
			$('.pLast', g.pDiv).click(function () {
				g.changePage('last');
			});
			$('.pcontrol input', g.pDiv).keydown(function (e) {
				if (e.keyCode == 13) {
					g.changePage('input');
				}
			});
			if ($.browser.msie && $.browser.version < 7) $('.pButton', g.pDiv).hover(function () {
				$(this).addClass('pBtnOver');
			}, function () {
				$(this).removeClass('pBtnOver');
			});
			if (p.useRp) {
				var opt = '',
					sel = '';
				for (var nx = 0; nx < p.rpOptions.length; nx++) {
					if (p.rp == p.rpOptions[nx]) sel = 'selected="selected"';
					else sel = '';
					opt += "<option value='" + p.rpOptions[nx] + "' " + sel + " >" + p.rpOptions[nx] + "&nbsp;&nbsp;</option>";
				}
				$('.pDiv2', g.pDiv).prepend("<div class='pGroup'><select name='rp'>" + opt + "</select></div> <div class='btnseparator'></div>");
				$('select', g.pDiv).change(function () {
					if (p.onRpChange) {
						p.onRpChange(+this.value);
					} else {
						p.newp = 1;
						p.rp = +this.value;
						g.populate();
					}
				});
			}
			//add search button
			if (p.searchitems) {
				$('.pDiv2', g.pDiv).prepend("<div class='pGroup'> <div class='pSearch pButton'><span></span></div> </div>  <div class='btnseparator'></div>");
				$('.pSearch', g.pDiv).click(function () {
					$(g.sDiv).slideToggle('fast', function () {
						$('.sDiv:visible input:first', g.gDiv).trigger('focus');
					});
				});
				//add search box
				g.sDiv.className = 'sDiv';
				var sitems = p.searchitems;
				var sopt = '', sel = '';
				for (var s = 0; s < sitems.length; s++) {
					if (p.qtype === '' && sitems[s].isdefault === true) {
						p.qtype = sitems[s].name;
						sel = 'selected="selected"';
					} else {
						sel = '';
					}
					sopt += "<option value='" + sitems[s].name + "' " + sel + " >" + sitems[s].display + "&nbsp;&nbsp;</option>";
				}
				if (p.qtype === '') {
					p.qtype = sitems[0].name;
				}
				$(g.sDiv).append("<div class='sDiv2'>" + p.findtext +
						" <input type='text' value='" + p.query + "' size='30' name='q' class='qsbox' /> " +
						" <select name='qtype'>" + sopt + "</select></div>");
				//Split into separate selectors because of bug in jQuery 1.3.2
				$('input[name=q]', g.sDiv).keydown(function (e) {
					if (e.keyCode == 13) {
						g.doSearch();
					}
				});
				$('select[name=qtype]', g.sDiv).keydown(function (e) {
					if (e.keyCode == 13) {
						g.doSearch();
					}
				});
				$('input[value=Clear]', g.sDiv).click(function () {
					$('input[name=q]', g.sDiv).val('');
					p.query = '';
					g.doSearch();
				});
				$(g.bDiv).after(g.sDiv);
			}
		}
		$(g.pDiv, g.sDiv).append("<div style='clear:both'></div>");
		// add title
		if (p.title) {
			g.mDiv.className = 'mDiv';
			g.mDiv.innerHTML = '<div class="ftitle">' + p.title + '</div>';
			$(g.gDiv).prepend(g.mDiv);
			if (p.showTableToggleBtn) {
				$(g.mDiv).append('<div class="ptogtitle" title="Minimize/Maximize Table"><span></span></div>');
				$('div.ptogtitle', g.mDiv).click(function () {
					$(g.gDiv).toggleClass('hideBody');
					$(this).toggleClass('vsble');
				});
			}
		}
		//setup cdrops
		g.cdropleft = document.createElement('span');
		g.cdropleft.className = 'cdropleft';
		g.cdropright = document.createElement('span');
		g.cdropright.className = 'cdropright';
		//add block
		g.block.className = 'gBlock';
		var gh = $(g.bDiv).height();
		var gtop = g.bDiv.offsetTop;
		$(g.block).css({
			width: g.bDiv.style.width,
			height: gh,
			background: 'white',
			position: 'relative',
			marginBottom: (gh * -1),
			zIndex: 1,
			top: gtop,
			left: '0px'
		});
		$(g.block).fadeTo(0, p.blockOpacity);
		// add column control
		if ($('th', g.hDiv).length) {
			g.nDiv.className = 'nDiv';
			g.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
			$(g.nDiv).css({
				marginBottom: (gh * -1),
				display: 'none',
				top: gtop
			}).noSelect();
			var cn = 0;
			$('th div', g.hDiv).each(function () {
				var kcol = $("th[axis='col" + cn + "']", g.hDiv)[0];
				var chk = 'checked="checked"';
				if (kcol.style.display == 'none') {
					chk = '';
				}
				var style = 'display:none';
				if (!$(kcol).attr("fixed")) {
					style = '';
				}
				$('tbody', g.nDiv).append('<tr style="' + style + '"><td class="ndcol1"><input type="checkbox" ' + chk + ' class="togCol" value="' + cn + '" /></td><td class="ndcol2">' + this.innerHTML + '</td></tr>');
				cn++;
			});
			if ($.browser.msie && $.browser.version < 7.0) $('tr', g.nDiv).hover(function () {
				$(this).addClass('ndcolover');
			}, function () {
				$(this).removeClass('ndcolover');
			});
			$('td.ndcol2', g.nDiv).click(function () {
				if ($('input:checked', g.nDiv).length <= p.minColToggle && $(this).prev().find('input')[0].checked) return false;
				return g.toggleCol($(this).prev().find('input').val());
			});
			$('input.togCol', g.nDiv).click(function () {
				if ($('input:checked', g.nDiv).length < p.minColToggle && this.checked === false) return false;
				$(this).parent().next().trigger('click');
			});
			$(g.gDiv).prepend(g.nDiv);
			$(g.nBtn).addClass('nBtn')
				.html('<div></div>')
				.attr('title', 'Hide/Show Columns')
				.click(function () {
					$(g.nDiv).toggle();
					return true;
				}
			);
			if (p.showToggleBtn) {
				$(g.gDiv).prepend(g.nBtn);
			}
		}
		// add date edit layer
		$(g.iDiv).addClass('iDiv').css({
			display: 'none'
		});
		$(g.bDiv).append(g.iDiv);
		// add flexigrid events
		$(g.bDiv).hover(function () {
			$(g.nDiv).hide();
			$(g.nBtn).hide();
		}, function () {
			if (g.multisel) {
				g.multisel = false;
			}
		});
		$(g.gDiv).hover(function () { }, function () {
			$(g.nDiv).hide();
			$(g.nBtn).hide();
		});
		//add document events
		$(document).mousemove(function (e) {
			g.dragMove(e);
		}).mouseup(function (e) {
			g.dragEnd();
		}).hover(function () { }, function () {
			g.dragEnd();
		});
		//browser adjustments
		if ($.browser.msie && $.browser.version < 7.0) {
			$('.hDiv,.bDiv,.mDiv,.pDiv,.vGrip,.tDiv, .sDiv', g.gDiv).css({
				width: '100%'
			});
			$(g.gDiv).addClass('ie6');
			if (p.width != 'auto') {
				$(g.gDiv).addClass('ie6fullwidthbug');
			}
		}
		g.rePosDrag();
		g.fixHeight();
		//make grid functions accessible
		t.p = p;
		t.grid = g;
		// load data
		if (p.url && p.autoload) {
			g.populate();
		}
		return t;
	};
	var docloaded = false;
	$(document).ready(function () {
		docloaded = true;
	});
	$.fn.flexigrid = function (p) {
		return this.each(function () {
			if (!docloaded) {
				$(this).hide();
				var t = this;
				$(document).ready(function () {
					$.addFlex(t, p);
				});
			} else {
				$.addFlex(this, p);
			}
		});
	}; //end flexigrid
	$.fn.flexReload = function (p) { // function to reload grid
		return this.each(function () {
			if (this.grid && this.p.url) this.grid.populate();
		});
	}; //end flexReload
	$.fn.flexOptions = function (p) { //function to update general options
		return this.each(function () {
			if (this.grid) $.extend(this.p, p);
		});
	}; //end flexOptions
	$.fn.flexToggleCol = function (cid, visible) { // function to reload grid
		return this.each(function () {
			if (this.grid) this.grid.toggleCol(cid, visible);
		});
	}; //end flexToggleCol
	$.fn.flexAddData = function (data) { // function to add data to grid
		return this.each(function () {
			if (this.grid) this.grid.addData(data);
		});
	};
	$.fn.noSelect = function (p) { //no select plugin by me :-)
		var prevent = (p === null) ? true : p;
		if (prevent) {
			return this.each(function () {
				if ($.browser.msie || $.browser.safari) $(this).bind('selectstart', function () {
					return false;
				});
				else if ($.browser.mozilla) {
					$(this).css('MozUserSelect', 'none');
					$('body').trigger('focus');
				} else if ($.browser.opera) $(this).bind('mousedown', function () {
					return false;
				});
				else $(this).attr('unselectable', 'on');
			});
		} else {
			return this.each(function () {
				if ($.browser.msie || $.browser.safari) $(this).unbind('selectstart');
				else if ($.browser.mozilla) $(this).css('MozUserSelect', 'inherit');
				else if ($.browser.opera) $(this).unbind('mousedown');
				else $(this).removeAttr('unselectable', 'on');
			});
		}
	}; //end noSelect
	$.fn.flexSearch = function (p) { // function to search grid
		return this.each(function () { if (this.grid && this.p.searchitems) this.grid.doSearch(); });
	}; //end flexSearch
})(jQuery);

// *****************************************************************************************************
// jquery.extention.js
// *****************************************************************************************************
(function ($) {
	$.fn.extend({
		center: function (options) {
			var options = $.extend({ // Default values
				inside: window, // element, center into window
				transition: 0, // millisecond, transition time
				minX: 0, // pixel, minimum left element value
				minY: 0, // pixel, minimum top element value
				withScrolling: true, // booleen, take care of the scrollbar (scrollTop)
				vertical: true, // booleen, center vertical
				horizontal: true // booleen, center horizontal
			}, options);
			return this.each(function () {
				var props = { position: 'absolute' };
				if (options.vertical) {
					var top = ($(options.inside).height() - $(this).outerHeight()) / 2;
					if (options.withScrolling) top += $(options.inside).scrollTop() || 0;
					top = (top > options.minY ? top : options.minY);
					$.extend(props, { top: top + 'px' });
				}
				if (options.horizontal) {
					var left = ($(options.inside).width() - $(this).outerWidth()) / 2;
					if (options.withScrolling) left += $(options.inside).scrollLeft() || 0;
					left = (left > options.minX ? left : options.minX);
					$.extend(props, { left: left + 'px' });
				}
				if (options.transition > 0) $(this).animate(props, options.transition);
				else $(this).css(props);
				return $(this);
			});
		},
		exists: function () {
			return jQuery(this).length > 0;
		},
		tabmenu: function () {
			return this.each(function () {
				$(this).addClass("ui-tabs ui-widget ui-corner-all");//ui-widget-content
				$(this)
					.find("ul:first")
					.addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all")
						.find("li")
						.addClass("ui-state-default ui-corner-top")
						.bind('mouseenter', function () {
							$(this).addClass("ui-state-hover");
						})
						.bind('mouseleave', function () {
							$(this).removeClass("ui-state-hover");
						});
			});
		}
	});
}(jQuery));

// *****************************************************************************************************
// jquery.watermark.min.js
// *****************************************************************************************************
(function (a, h, y) { var w = "function", v = "password", j = "maxLength", n = "type", b = "", c = true, u = "placeholder", i = false, t = "watermark", g = t, f = "watermarkClass", q = "watermarkFocus", l = "watermarkSubmit", o = "watermarkMaxLength", e = "watermarkPassword", d = "watermarkText", k = /\r/g, s = "input:data(" + g + "),textarea:data(" + g + ")", m = "input:text,input:password,input[type=search],input:not([type]),textarea", p = ["Page_ClientValidate"], r = i, x = u in document.createElement("input"); a.watermark = a.watermark || { version: "3.1.3", runOnce: c, options: { className: t, useNative: c, hideBeforeUnload: c }, hide: function (b) { a(b).filter(s).each(function () { a.watermark._hide(a(this)) }) }, _hide: function (a, r) { var p = a[0], q = (p.value || b).replace(k, b), l = a.data(d) || b, m = a.data(o) || 0, i = a.data(f); if (l.length && q == l) { p.value = b; if (a.data(e)) if ((a.attr(n) || b) === "text") { var g = a.data(e) || [], c = a.parent() || []; if (g.length && c.length) { c[0].removeChild(a[0]); c[0].appendChild(g[0]); a = g } } if (m) { a.attr(j, m); a.removeData(o) } if (r) { a.attr("autocomplete", "off"); h.setTimeout(function () { a.select() }, 1) } } i && a.removeClass(i) }, show: function (b) { a(b).filter(s).each(function () { a.watermark._show(a(this)) }) }, _show: function (g) { var p = g[0], u = (p.value || b).replace(k, b), h = g.data(d) || b, s = g.attr(n) || b, t = g.data(f); if ((u.length == 0 || u == h) && !g.data(q)) { r = c; if (g.data(e)) if (s === v) { var m = g.data(e) || [], l = g.parent() || []; if (m.length && l.length) { l[0].removeChild(g[0]); l[0].appendChild(m[0]); g = m; g.attr(j, h.length); p = g[0] } } if (s === "text" || s === "search") { var i = g.attr(j) || 0; if (i > 0 && h.length > i) { g.data(o, i); g.attr(j, h.length) } } t && g.addClass(t); p.value = h } else a.watermark._hide(g) }, hideAll: function () { if (r) { a.watermark.hide(m); r = i } }, showAll: function () { a.watermark.show(m) } }; a.fn.watermark = a.fn.watermark || function (p, o) { var t = "string"; if (!this.length) return this; var s = i, r = typeof p === t; if (r) p = p.replace(k, b); if (typeof o === "object") { s = typeof o.className === t; o = a.extend({}, a.watermark.options, o) } else if (typeof o === t) { s = c; o = a.extend({}, a.watermark.options, { className: o }) } else o = a.watermark.options; if (typeof o.useNative !== w) o.useNative = o.useNative ? function () { return c } : function () { return i }; return this.each(function () { var B = "dragleave", A = "dragenter", z = this, i = a(z); if (!i.is(m)) return; if (i.data(g)) { if (r || s) { a.watermark._hide(i); r && i.data(d, p); s && i.data(f, o.className) } } else { if (x && o.useNative.call(z, i) && (i.attr("tagName") || b) !== "TEXTAREA") { r && i.attr(u, p); return } i.data(d, r ? p : b); i.data(f, o.className); i.data(g, 1); if ((i.attr(n) || b) === v) { var C = i.wrap("<span>").parent(), t = a(C.html().replace(/type=["']?password["']?/i, 'type="text"')); t.data(d, i.data(d)); t.data(f, i.data(f)); t.data(g, 1); t.attr(j, p.length); t.focus(function () { a.watermark._hide(t, c) }).bind(A, function () { a.watermark._hide(t) }).bind("dragend", function () { h.setTimeout(function () { t.blur() }, 1) }); i.blur(function () { a.watermark._show(i) }).bind(B, function () { a.watermark._show(i) }); t.data(e, i); i.data(e, t) } else i.focus(function () { i.data(q, 1); a.watermark._hide(i, c) }).blur(function () { i.data(q, 0); a.watermark._show(i) }).bind(A, function () { a.watermark._hide(i) }).bind(B, function () { a.watermark._show(i) }).bind("dragend", function () { h.setTimeout(function () { a.watermark._show(i) }, 1) }).bind("drop", function (e) { var c = i[0], a = e.originalEvent.dataTransfer.getData("Text"); if ((c.value || b).replace(k, b).replace(a, b) === i.data(d)) c.value = a; i.focus() }); if (z.form) { var w = z.form, y = a(w); if (!y.data(l)) { y.submit(a.watermark.hideAll); if (w.submit) { y.data(l, w.submit); w.submit = function (c, b) { return function () { var d = b.data(l); a.watermark.hideAll(); if (d.apply) d.apply(c, Array.prototype.slice.call(arguments)); else d() } }(w, y) } else { y.data(l, 1); w.submit = function (b) { return function () { a.watermark.hideAll(); delete b.submit; b.submit() } }(w) } } } } a.watermark._show(i) }) }; if (a.watermark.runOnce) { a.watermark.runOnce = i; a.extend(a.expr[":"], { data: function (c, d, b) { return !!a.data(c, b[3]) } }); (function (c) { a.fn.val = function () { var e = this; if (!e.length) return arguments.length ? e : y; if (!arguments.length) if (e.data(g)) { var f = (e[0].value || b).replace(k, b); return f === (e.data(d) || b) ? b : f } else return c.apply(e, arguments); else { c.apply(e, arguments); a.watermark.show(e); return e } } })(a.fn.val); p.length && a(function () { for (var b, c, d = p.length - 1; d >= 0; d--) { b = p[d]; c = h[b]; if (typeof c === w) h[b] = function (b) { return function () { a.watermark.hideAll(); return b.apply(null, Array.prototype.slice.call(arguments)) } }(c) } }); a(h).bind("beforeunload", function () { a.watermark.options.hideBeforeUnload && a.watermark.hideAll() }) } })(jQuery, window);

// *****************************************************************************************************
// jquery.cascadingdropdown.js
// *****************************************************************************************************
(function ($) {
	$.fn.CascadingDropDown = function (source, actionPath, settings) {

		if (typeof source === 'undefined') {
			throw "A source element is required";
		}

		if (typeof actionPath == 'undefined') {
			throw "An action path is requried";
		}

		var optionTag = '<option></option>';
		var config = $.extend({}, $.fn.CascadingDropDown.defaults, settings);

		return this.each(function () {
			var $this = $(this);

			(function () {
				var methods = {
					clearItems: function () {
						$this.empty();
						if (!$this.attr("disabled")) {
							$this.attr("disabled", "disabled");
						}
					},
					reset: function () {
						methods.clearItems();
						if (config.promptText != null) {
							$this.append($(optionTag)
                            .attr("value", "")
                            .text(config.promptText));
						}
						$this.trigger('change');
					},
					initialize: function () {
						if ($this.children().size() == 0) {
							methods.reset();
						}
					},
					showLoading: function () {
						methods.clearItems();
						$this.append($(optionTag)
                            .attr("value", "")
                            .text(config.loadingText));
					},
					loaded: function () {
						$this.removeAttr("disabled");
						$this.trigger('change');
					},
					showError: function () {
						methods.clearItems();
						$this.append($(optionTag)
                            .attr("value", "")
                            .text(config.errorText));
					},
					post: function () {
						methods.showLoading();
						$.isFunction(config.onLoading) && config.onLoading.call($this);
						$.ajax({
							url: actionPath,
							type: 'POST',
							dataType: 'json',
							context: $this,
							data: ((typeof config.postData == "function") ? config.postData() : config.postData) || $(source).serialize(),
							success: function (data) {
								methods.reset();
								$.each(data, function () {
									$this.append($(optionTag)
                                        .attr("value", this.Value)
                                        .text(this.Text));
								});
								methods.loaded();
								$.isFunction(config.onLoaded) && config.onLoaded.call($this);
							},
							error: function () {
								methods.showError();
							}
						});
					}
				};

				$(source).change(function () {
					var parentSelect = $(source);
					if (parentSelect.val() != '') {
						methods.post();
					}
					else {
						methods.reset();
					}
				});

				methods.initialize();

			})();
		});
	}

	$.fn.CascadingDropDown.defaults = {
		promptText: '-- Select --',
		loadingText: 'Loading ..',
		errorText: 'Error loading data.',
		postData: null,
		onLoading: null,
		onLoaded: null
	};
})(jQuery);

// *****************************************************************************************************
// jquery.dropdownchecklist.js
// *****************************************************************************************************
; (function ($) {
	/*
        * ui.dropdownchecklist
        *
        * Copyright (c) 2008-2010 Adrian Tosca, Copyright (c) 2010-2011 Ittrium LLC
        * Dual licensed under the MIT (MIT-LICENSE.txt) OR GPL (GPL-LICENSE.txt) licenses.
        *
    */
	// The dropdown check list jQuery plugin transforms a regular select html element into a dropdown check list.
	$.widget("ui.dropdownchecklist", {
		// Some globlals
		// $.ui.dropdownchecklist.gLastOpened - keeps track of last opened dropdowncheck list so we can close it
		// $.ui.dropdownchecklist.gIDCounter - simple counter to provide a unique ID as needed
		version: function () {
			alert('DropDownCheckList v1.4');
		},
		// Creates the drop container that keeps the items and appends it to the document
		_appendDropContainer: function (controlItem) {
			var wrapper = $("<div/>");
			// the container is wrapped in a div
			wrapper.addClass("ui-dropdownchecklist ui-dropdownchecklist-dropcontainer-wrapper");
			wrapper.addClass("ui-widget");
			// assign an id
			wrapper.attr("id", controlItem.attr("id") + '-ddw');
			// initially positioned way off screen to prevent it from displaying
			// NOTE absolute position to enable width/height calculation
			wrapper.css({ position: 'absolute', left: "-33000px", top: "-33000px" });

			var container = $("<div/>"); // the actual container
			container.addClass("ui-dropdownchecklist-dropcontainer ui-widget-content");
			container.css("overflow-y", "auto");
			wrapper.append(container);

			// insert the dropdown after the master control to try to keep the tab order intact
			// if you just add it to the end, tabbing out of the drop down takes focus off the page
			// @todo 22Sept2010 - check if size calculation is thrown off if the parent of the
			//		selector is hidden.  We may need to add it to the end of the document here, 
			//		calculate the size, and then move it back into proper position???
			//$(document.body).append(wrapper);
			wrapper.insertAfter(controlItem);

			// flag that tells if the drop container is shown or not
			wrapper.isOpen = false;
			return wrapper;
		},
		// Look for browser standard 'open' on a closed selector
		_isDropDownKeyShortcut: function (e, keycode) {
			return e.altKey && ($.ui.keyCode.DOWN == keycode);// Alt + Down Arrow
		},
		// Look for key that will tell us to close the open dropdown
		_isDropDownCloseKey: function (e, keycode) {
			return ($.ui.keyCode.ESCAPE == keycode) || ($.ui.keyCode.ENTER == keycode);
		},
		// Handler to change the active focus based on a keystroke, moving some count of
		// items from the element that has the current focus
		_keyFocusChange: function (target, delta, limitToItems) {
			// Find item with current focus
			var focusables = $(":focusable");
			var index = focusables.index(target);
			if (index >= 0) {
				index += delta;
				if (limitToItems) {
					// Bound change to list of input elements
					var allCheckboxes = this.dropWrapper.find("input:not([disabled])");
					var firstIndex = focusables.index(allCheckboxes.get(0));
					var lastIndex = focusables.index(allCheckboxes.get(allCheckboxes.length - 1));
					if (index < firstIndex) {
						index = lastIndex;
					} else if (index > lastIndex) {
						index = firstIndex;
					}
				}
				focusables.get(index).focus();
			}
		},
		// Look for navigation, open, close (wired to keyup)
		_handleKeyboard: function (e) {
			var self = this;
			var keyCode = (e.keyCode || e.which);
			if (!self.dropWrapper.isOpen && self._isDropDownKeyShortcut(e, keyCode)) {
				// Key command to open the dropdown
				e.stopImmediatePropagation();
				self._toggleDropContainer(true);
			} else if (self.dropWrapper.isOpen && self._isDropDownCloseKey(e, keyCode)) {
				// Key command to close the dropdown (but we retain focus in the control)
				e.stopImmediatePropagation();
				self._toggleDropContainer(false);
				self.controlSelector.focus();
			} else if (self.dropWrapper.isOpen
					&& (e.target.type == 'checkbox')
					&& ((keyCode == $.ui.keyCode.DOWN) || (keyCode == $.ui.keyCode.UP))) {
				// Up/Down to cycle throught the open items
				e.stopImmediatePropagation();
				self._keyFocusChange(e.target, (keyCode == $.ui.keyCode.DOWN) ? 1 : -1, true);
			} else if (self.dropWrapper.isOpen && (keyCode == $.ui.keyCode.TAB)) {
				// I wanted to adjust normal 'tab' processing here, but research indicates
				// that TAB key processing is NOT a cancelable event. You have to use a timer
				// hack to pull the focus back to where you want it after browser tab
				// processing completes.  Not going to work for us.
				//e.stopImmediatePropagation();
				//self._keyFocusChange(e.target, (e.shiftKey) ? -1 : 1, true);
			}
		},
		// Look for change of focus
		_handleFocus: function (e, focusIn, forDropdown) {
			var self = this;
			if (forDropdown && !self.dropWrapper.isOpen) {
				// if the focus changes when the control is NOT open, mark it to show where the focus is/is not
				e.stopImmediatePropagation();
				if (focusIn) {
					self.controlSelector.addClass("ui-state-hover");
					if ($.ui.dropdownchecklist.gLastOpened != null) {
						$.ui.dropdownchecklist.gLastOpened._toggleDropContainer(false);
					}
				} else {
					self.controlSelector.removeClass("ui-state-hover");
				}
			} else if (!forDropdown && !focusIn) {
				// The dropdown is open, and an item (NOT the dropdown) has just lost the focus.
				// we really need a reliable method to see who has the focus as we process the blur,
				// but that mechanism does not seem to exist.  Instead we rely on a delay before
				// posting the blur, with a focus event cancelling it before the delay expires.
				if (e != null) { e.stopImmediatePropagation(); }
				self.controlSelector.removeClass("ui-state-hover");
				self._toggleDropContainer(false);
			}
		},
		// Clear the pending change of focus, which keeps us 'in' the control
		_cancelBlur: function (e) {
			var self = this;
			if (self.blurringItem != null) {
				clearTimeout(self.blurringItem);
				self.blurringItem = null;
			}
		},
		// Creates the control that will replace the source select and appends it to the document
		// The control resembles a regular select with single selection
		_appendControl: function () {
			var self = this, sourceSelect = this.sourceSelect, options = this.options;

			// the control is wrapped in a basic container
			// inline-block at this level seems to give us better size control
			var wrapper = $("<span/>");
			wrapper.addClass("ui-dropdownchecklist ui-dropdownchecklist-selector-wrapper ui-widget");
			wrapper.css({ display: "inline-block", cursor: "default", overflow: "hidden" });

			// assign an ID 
			var baseID = sourceSelect.attr("id");
			if ((baseID == null) || (baseID == "")) {
				baseID = "ddcl-" + $.ui.dropdownchecklist.gIDCounter++;
			} else {
				baseID = "ddcl-" + baseID;
			}
			wrapper.attr("id", baseID);

			// the actual control which you can style
			// inline-block needed to enable 'width' but has interesting problems cross browser
			var control = $("<span/>");
			control.addClass("ui-dropdownchecklist-selector");//ui-state-default
			control.css({ display: "inline-block", overflow: "hidden", 'white-space': 'nowrap' });
			// Setting a tab index means we are interested in the tab sequence
			var tabIndex = sourceSelect.attr("tabIndex");
			if (tabIndex == null) {
				tabIndex = 0;
			} else {
				tabIndex = parseInt(tabIndex);
				if (tabIndex < 0) {
					tabIndex = 0;
				}
			}
			control.attr("tabIndex", tabIndex);
			control.keyup(function (e) { self._handleKeyboard(e); });
			control.focus(function (e) { self._handleFocus(e, true, true); });
			control.blur(function (e) { self._handleFocus(e, false, true); });
			wrapper.append(control);

			// the optional icon (which is inherently a block) which we can float
			if (options.icon != null) {
				var iconPlacement = (options.icon.placement == null) ? "left" : options.icon.placement;
				var anIcon = $("<div/>");
				anIcon.addClass("ui-icon");
				anIcon.addClass((options.icon.toOpen != null) ? options.icon.toOpen : "ui-icon-triangle-1-e");
				anIcon.css({ 'float': iconPlacement });
				control.append(anIcon);
			}
			// the text container keeps the control text that is built from the selected (checked) items
			// inline-block needed to prevent long text from wrapping to next line when icon is active
			var textContainer = $("<span/>");
			textContainer.addClass("ui-dropdownchecklist-text");
			textContainer.css({ display: "inline-block", 'white-space': "nowrap", overflow: "hidden" });
			control.append(textContainer);

			// add the hover styles to the control
			wrapper.hover(
	            function () {
	            	if (!self.disabled) {
	            		control.addClass("ui-state-hover");
	            	}
	            }
	        , function () {
	        	if (!self.disabled) {
	        		control.removeClass("ui-state-hover");
	        	}
	        }
	        );
			// clicking on the control toggles the drop container
			wrapper.click(function (event) {
				if (!self.disabled) {
					event.stopImmediatePropagation();
					self._toggleDropContainer(!self.dropWrapper.isOpen);
				}
			});
			wrapper.insertAfter(sourceSelect);

			// Watch for a window resize and adjust the control if open
			$(window).resize(function () {
				if (!self.disabled && self.dropWrapper.isOpen) {
					// Reopen yourself to get the position right
					self._toggleDropContainer(true);
				}
			});
			return wrapper;
		},
		// Creates a drop item that coresponds to an option element in the source select
		_createDropItem: function (index, tabIndex, value, text, optCss, checked, disabled, indent, name) {
			var self = this, options = this.options, sourceSelect = this.sourceSelect, controlWrapper = this.controlWrapper;
			// the item contains a div that contains a checkbox input and a lable for the text
			// the div
			var item = $("<div/>");
			item.addClass("ui-dropdownchecklist-item");
			item.css({ 'white-space': "nowrap" });
			var checkedString = checked ? ' checked="checked"' : '';
			var classString = disabled ? ' class="inactive"' : ' class="active"';

			// generated id must be a bit unique to keep from colliding
			var idBase = controlWrapper.attr("id");
			var id = idBase + '-i' + index;
			var checkBox;

			// all items start out disabled to keep them out of the tab order
			if (self.isMultiple) { // the checkbox
				checkBox = $('<input disabled type="checkbox" id="' + id + '" name="' + name + '"' + checkedString + classString + ' tabindex="' + tabIndex + '" />');
			} else { // the radiobutton
				checkBox = $('<input disabled type="radio" id="' + id + '" name="' + idBase + '"' + checkedString + classString + ' tabindex="' + tabIndex + '" />');
			}
			checkBox = checkBox.attr("index", index).val(value);
			item.append(checkBox);

			// the text
			var label = $("<label for=" + id + "/>");
			label.addClass("ui-dropdownchecklist-text");
			if (optCss != null) label.attr('style', optCss);
			label.css({ cursor: "default" });
			label.html(text);
			if (indent) {
				item.addClass("ui-dropdownchecklist-indent");
			}
			item.addClass("ui-state-default");
			if (disabled) {
				item.addClass("ui-state-disabled");
			}
			label.click(function (e) { e.stopImmediatePropagation(); });
			item.append(label);

			// active items display themselves with hover
			item.hover(
            	function (e) {
            		var anItem = $(this);
            		if (!anItem.hasClass("ui-state-disabled")) { anItem.addClass("ui-state-hover"); }
            	}
            , function (e) {
            	var anItem = $(this);
            	anItem.removeClass("ui-state-hover");
            }
            );
			// clicking on the checkbox synchronizes the source select
			checkBox.click(function (e) {
				var aCheckBox = $(this);
				e.stopImmediatePropagation();
				if (aCheckBox.hasClass("active")) {
					// Active checkboxes take active action
					var callback = self.options.onItemClick;
					if ($.isFunction(callback)) try {
						callback.call(self, aCheckBox, sourceSelect.get(0));
					} catch (ex) {
						// reject the change on any error
						aCheckBox.prop("checked", !aCheckBox.prop("checked"));
						self._syncSelected(aCheckBox);
						return;
					}
					self._syncSelected(aCheckBox);
					self.sourceSelect.trigger("change", 'ddcl_internal');
					if (!self.isMultiple && options.closeRadioOnClick) {
						self._toggleDropContainer(false);
					}
				}
			});
			// we are interested in the focus leaving the check box
			// but we need to detect the focus leaving one check box but
			// entering another. There is no reliable way to detect who
			// received the focus on a blur, so post the blur in the future,
			// knowing we will cancel it if we capture the focus in a timely manner
			// 23Sept2010 - unfortunately, IE 7+ and Chrome like to post a blur
			// 				event to the current item with focus when the user
			//				clicks in the scroll bar. So if you have a scrollable
			//				dropdown with focus on an item, clicking in the scroll
			//				will close the drop down.
			//				I have no solution for blur processing at this time.
			/*********
                        var timerFunction = function(){ 
                            // I had a hell of a time getting setTimeout to fire this, do not try to
                            // define it within the blur function
                            try { self._handleFocus(null,false,false); } catch(ex){ alert('timer failed: '+ex);}
                        };
                        checkBox.blur(function(e) { 
                            self.blurringItem = setTimeout( timerFunction, 200 ); 
                        });
                        checkBox.focus(function(e) {self._cancelBlur();});
            **********/
			// check/uncheck the item on clicks on the entire item div
			item.click(function (e) {
				var anItem = $(this);
				e.stopImmediatePropagation();
				if (!anItem.hasClass("ui-state-disabled")) {
					// check/uncheck the underlying control
					var aCheckBox = anItem.find("input");
					var checked = aCheckBox.prop("checked");
					aCheckBox.prop("checked", !checked);

					var callback = self.options.onItemClick;
					if ($.isFunction(callback)) try {
						callback.call(self, aCheckBox, sourceSelect.get(0));
					} catch (ex) {
						// reject the change on any error
						aCheckBox.prop("checked", checked);
						self._syncSelected(aCheckBox);
						return;
					}
					self._syncSelected(aCheckBox);
					self.sourceSelect.trigger("change", 'ddcl_internal');
					if (!checked && !self.isMultiple && options.closeRadioOnClick) {
						self._toggleDropContainer(false);
					}
				} else {
					// retain the focus even if disabled
					anItem.focus();
					self._cancelBlur();
				}
			});
			// do not let the focus wander around
			item.focus(function (e) {
				var anItem = $(this);
				e.stopImmediatePropagation();
			});
			item.keyup(function (e) { self._handleKeyboard(e); });
			return item;
		},
		_createGroupItem: function (text, disabled) {
			var self = this;
			var group = $("<div />");
			group.addClass("ui-dropdownchecklist-group ui-widget-header");
			if (disabled) {
				group.addClass("ui-state-disabled");
			}
			group.css({ 'white-space': "nowrap" });

			var label = $("<span/>");
			label.addClass("ui-dropdownchecklist-text");
			label.css({ cursor: "default" });
			label.text(text);
			group.append(label);

			// anything interesting when you click the group???
			group.click(function (e) {
				var aGroup = $(this);
				e.stopImmediatePropagation();
				// retain the focus even if no action is taken
				aGroup.focus();
				self._cancelBlur();
			});
			// do not let the focus wander around
			group.focus(function (e) {
				var aGroup = $(this);
				e.stopImmediatePropagation();
			});
			return group;
		},
		_createCloseItem: function (text) {
			var self = this;
			var closeItem = $("<div />");
			closeItem.addClass("ui-state-default ui-dropdownchecklist-close ui-dropdownchecklist-item");
			closeItem.css({ 'white-space': 'nowrap', 'text-align': 'right' });

			var label = $("<span/>");
			label.addClass("ui-dropdownchecklist-text");
			label.css({ cursor: "default" });
			label.html(text);
			closeItem.append(label);

			// close the control on click
			closeItem.click(function (e) {
				var aGroup = $(this);
				e.stopImmediatePropagation();
				// retain the focus even if no action is taken
				aGroup.focus();
				self._toggleDropContainer(false);
			});
			closeItem.hover(
            	function (e) { $(this).addClass("ui-state-hover"); }
            , function (e) { $(this).removeClass("ui-state-hover"); }
            );
			// do not let the focus wander around
			closeItem.focus(function (e) {
				var aGroup = $(this);
				e.stopImmediatePropagation();
			});
			return closeItem;
		},
		// Creates the drop items and appends them to the drop container
		// Also calculates the size needed by the drop container and returns it
		_appendItems: function () {
			var self = this, config = this.options, sourceSelect = this.sourceSelect, dropWrapper = this.dropWrapper;
			var dropContainerDiv = dropWrapper.find(".ui-dropdownchecklist-dropcontainer");
			sourceSelect.children().each(function (index) { // when the select has groups
				var opt = $(this);
				if (opt.is("option")) {
					self._appendOption(opt, dropContainerDiv, index, false, false);
				} else if (opt.is("optgroup")) {
					var disabled = opt.prop("disabled");
					var text = opt.attr("label");
					if (text != "") {
						var group = self._createGroupItem(text, disabled);
						dropContainerDiv.append(group);
					}
					self._appendOptions(opt, dropContainerDiv, index, true, disabled);
				}
			});
			if (config.explicitClose != null) {
				var closeItem = self._createCloseItem(config.explicitClose);
				dropContainerDiv.append(closeItem);
			}
			var divWidth = dropContainerDiv.outerWidth();
			var divHeight = dropContainerDiv.outerHeight();
			return { width: divWidth, height: divHeight };
		},
		_appendOptions: function (parent, container, parentIndex, indent, forceDisabled) {
			var self = this;
			parent.children("option").each(function (index) {
				var option = $(this);
				var childIndex = (parentIndex + "." + index);
				self._appendOption(option, container, childIndex, indent, forceDisabled);
			});
		},
		_appendOption: function (option, container, index, indent, forceDisabled) {
			var self = this;
			// Note that the browsers destroy any html structure within the OPTION
			var text = option.html();
			if ((text != null) && (text != '')) {
				var value = option.val();
				var optCss = option.attr('style');
				var selected = option.prop("selected");
				var disabled = (forceDisabled || option.prop("disabled"));
				// Use the same tab index as the selector replacement
				var tabIndex = self.controlSelector.attr("tabindex");
				var name = $(this.sourceSelect).attr("name");
				var item = self._createDropItem(index, tabIndex, value, text, optCss, selected, disabled, indent, name);
				container.append(item);
			}
		},
		// Synchronizes the items checked and the source select
		// When firstItemChecksAll option is active also synchronizes the checked items
		// senderCheckbox parameters is the checkbox input that generated the synchronization
		_syncSelected: function (senderCheckbox) {
			var self = this, options = this.options, sourceSelect = this.sourceSelect, dropWrapper = this.dropWrapper;
			var selectOptions = sourceSelect.get(0).options;
			var allCheckboxes = dropWrapper.find("input.active");
			if (options.firstItemChecksAll == 'exclusive') {
				if ((senderCheckbox == null) && $(selectOptions[0]).prop("selected")) {
					// Initialization call with first item active
					allCheckboxes.prop("checked", false);
					$(allCheckboxes[0]).prop("checked", true);
				} else if ((senderCheckbox != null) && (senderCheckbox.attr("index") == 0)) {
					// Action on the first, so all other checkboxes NOT active
					var firstIsActive = senderCheckbox.prop("checked");
					allCheckboxes.prop("checked", false);
					$(allCheckboxes[0]).prop("checked", firstIsActive);
				} else {
					// check the first checkbox if all the other checkboxes are checked
					var allChecked = true;
					var firstCheckbox = null;
					allCheckboxes.each(function (index) {
						if (index > 0) {
							var checked = $(this).prop("checked");
							if (!checked) { allChecked = false; }
						} else {
							firstCheckbox = $(this);
						}
					});
					if (firstCheckbox != null) {
						if (allChecked) {
							// when all are checked, only the first left checked
							allCheckboxes.prop("checked", false);
						}
						firstCheckbox.prop("checked", allChecked);
					}
				}
			} else if (options.firstItemChecksAll) {
				if ((senderCheckbox == null) && $(selectOptions[0]).prop("selected")) {
					// Initialization call with first item active so force all to be active
					allCheckboxes.prop("checked", true);
				} else if ((senderCheckbox != null) && (senderCheckbox.attr("index") == 0)) {
					// Check all checkboxes if the first one is checked
					allCheckboxes.prop("checked", senderCheckbox.prop("checked"));
				} else {
					// check the first checkbox if all the other checkboxes are checked
					var allChecked = true;
					var firstCheckbox = null;
					allCheckboxes.each(function (index) {
						if (index > 0) {
							var checked = $(this).prop("checked");
							if (!checked) { allChecked = false; }
						} else {
							firstCheckbox = $(this);
						}
					});
					if (firstCheckbox != null) {
						firstCheckbox.prop("checked", allChecked);
					}
				}
			}
			// do the actual synch with the source select
			var empties = 0;
			allCheckboxes = dropWrapper.find("input");
			allCheckboxes.each(function (index) {
				var anOption = $(selectOptions[index + empties]);
				var optionText = anOption.html();
				if ((optionText == null) || (optionText == '')) {
					empties += 1;
					anOption = $(selectOptions[index + empties]);
				}
				anOption.prop("selected", $(this).prop("checked"));
			});
			// update the text shown in the control
			self._updateControlText();

			// Ensure the focus stays pointing where the user is working
			if (senderCheckbox != null) { senderCheckbox.focus(); }
		},
		_sourceSelectChangeHandler: function (event) {
			var self = this, dropWrapper = this.dropWrapper;
			dropWrapper.find("input").val(self.sourceSelect.val());

			// update the text shown in the control
			self._updateControlText();
		},
		// Updates the text shown in the control depending on the checked (selected) items
		_updateControlText: function () {
			var self = this, sourceSelect = this.sourceSelect, options = this.options, controlWrapper = this.controlWrapper;
			var firstOption = sourceSelect.find("option:first");
			var selectOptions = sourceSelect.find("option");
			var text = self._formatText(selectOptions, options.firstItemChecksAll, firstOption);
			var controlLabel = controlWrapper.find(".ui-dropdownchecklist-text");
			controlLabel.html(text);
			// the attribute needs naked text, not html
			controlLabel.attr("title", controlLabel.text());
		},
		// Formats the text that is shown in the control
		_formatText: function (selectOptions, firstItemChecksAll, firstOption) {
			var text;
			if ($.isFunction(this.options.textFormatFunction)) {
				// let the callback do the formatting, but do not allow it to fail
				try {
					text = this.options.textFormatFunction(selectOptions);
				} catch (ex) {
					alert('textFormatFunction failed: ' + ex);
				}
			} else if (firstItemChecksAll && (firstOption != null) && firstOption.prop("selected")) {
				// just set the text from the first item
				text = firstOption.html();
			} else {
				// concatenate the text from the checked items
				text = "";
				selectOptions.each(function () {
					if ($(this).prop("selected")) {
						if (text != "") { text += ", "; }
						/* NOTE use of .html versus .text, which can screw up ampersands for IE */
						var optCss = $(this).attr('style');
						var tempspan = $('<span/>');
						tempspan.html($(this).html());
						if (optCss == null) {
							text += tempspan.html();
						} else {
							tempspan.attr('style', optCss);
							text += $("<span/>").append(tempspan).html();
						}
					}
				});
				if (text == "") {
					text = (this.options.emptyText != null) ? this.options.emptyText : "&nbsp;";
				}
			}
			return text;
		},
		// Shows and hides the drop container
		_toggleDropContainer: function (makeOpen) {
			var self = this;
			// hides the last shown drop container
			var hide = function (instance) {
				if ((instance != null) && instance.dropWrapper.isOpen) {
					instance.dropWrapper.isOpen = false;
					$.ui.dropdownchecklist.gLastOpened = null;

					var config = instance.options;
					instance.dropWrapper.css({
						top: "-33000px",
						left: "-33000px"
					});
					var aControl = instance.controlSelector;
					aControl.removeClass("ui-state-active");
					aControl.removeClass("ui-state-hover");

					var anIcon = instance.controlWrapper.find(".ui-icon");
					if (anIcon.length > 0) {
						anIcon.removeClass((config.icon.toClose != null) ? config.icon.toClose : "ui-icon-triangle-1-s");
						anIcon.addClass((config.icon.toOpen != null) ? config.icon.toOpen : "ui-icon-triangle-1-e");
					}
					$(document).unbind("click", hide);

					// keep the items out of the tab order by disabling them
					instance.dropWrapper.find("input.active").prop("disabled", true);

					// the following blur just does not fire???  because it is hidden???  because it does not have focus???
					//instance.sourceSelect.trigger("blur");
					//instance.sourceSelect.triggerHandler("blur");
					if ($.isFunction(config.onComplete)) {
						try {
							config.onComplete.call(instance, instance.sourceSelect.get(0));
						} catch (ex) {
							alert('callback failed: ' + ex);
						}
					}
				}
			};
			// shows the given drop container instance
			var show = function (instance) {
				if (!instance.dropWrapper.isOpen) {
					instance.dropWrapper.isOpen = true;
					$.ui.dropdownchecklist.gLastOpened = instance;

					var config = instance.options;
					/**** Issue127 (and the like) to correct positioning when parent element is relative
                     ****	This positioning only worked with simple, non-relative parent position
                                        instance.dropWrapper.css({
                                            top: instance.controlWrapper.offset().top + instance.controlWrapper.outerHeight() + "px",
                                            left: instance.controlWrapper.offset().left + "px"
                                        });
                    ****/
					if ((config.positionHow == null) || (config.positionHow == 'absolute')) {
						/** Floats above subsequent content, but does NOT scroll */
						instance.dropWrapper.css({
							position: 'absolute'
		                , top: instance.controlWrapper.position().top + instance.controlWrapper.outerHeight() + "px"
		                , left: instance.controlWrapper.position().left + "px"
						});
					} else if (config.positionHow == 'relative') {
						/** Scrolls with the parent but does NOT float above subsequent content */
						instance.dropWrapper.css({
							position: 'relative'
		                , top: "0px"
		                , left: "0px"
						});
					}
					var zIndex = 0;
					if (config.zIndex == null) {
						var ancestorsZIndexes = instance.controlWrapper.parents().map(
							function () {
								var zIndex = $(this).css("z-index");
								return isNaN(zIndex) ? 0 : zIndex;
							}
							).get();
						var parentZIndex = Math.max.apply(Math, ancestorsZIndexes);
						if (parentZIndex >= 0) zIndex = parentZIndex + 1;
					} else {
						/* Explicit set from the optins */
						zIndex = parseInt(config.zIndex);
					}
					if (zIndex > 0) {
						instance.dropWrapper.css({ 'z-index': zIndex });
					}

					var aControl = instance.controlSelector;
					aControl.addClass("ui-state-active");
					aControl.removeClass("ui-state-hover");

					var anIcon = instance.controlWrapper.find(".ui-icon");
					if (anIcon.length > 0) {
						anIcon.removeClass((config.icon.toOpen != null) ? config.icon.toOpen : "ui-icon-triangle-1-e");
						anIcon.addClass((config.icon.toClose != null) ? config.icon.toClose : "ui-icon-triangle-1-s");
					}
					$(document).bind("click", function (e) { hide(instance); });

					// insert the items back into the tab order by enabling all active ones
					var activeItems = instance.dropWrapper.find("input.active");
					activeItems.prop("disabled", false);

					// we want the focus on the first active input item
					var firstActiveItem = activeItems.get(0);
					if (firstActiveItem != null) {
						firstActiveItem.focus();
					}
				}
			};
			if (makeOpen) {
				hide($.ui.dropdownchecklist.gLastOpened);
				show(self);
			} else {
				hide(self);
			}
		},
		// Set the size of the control and of the drop container
		_setSize: function (dropCalculatedSize) {
			var options = this.options, dropWrapper = this.dropWrapper, controlWrapper = this.controlWrapper;

			// use the width from config options if set, otherwise set the same width as the drop container
			var controlWidth = dropCalculatedSize.width;
			if (options.width != null) {
				controlWidth = parseInt(options.width);
			} else if (options.minWidth != null) {
				var minWidth = parseInt(options.minWidth);
				// if the width is too small (usually when there are no items) set a minimum width
				if (controlWidth < minWidth) {
					controlWidth = minWidth;
				}
			}
			var control = this.controlSelector;
			control.css({ width: controlWidth + "px" });

			// if we size the text, then Firefox places icons to the right properly
			// and we do not wrap on long lines
			var controlText = control.find(".ui-dropdownchecklist-text");
			var controlIcon = control.find(".ui-icon");
			if (controlIcon != null) {
				// Must be an inner/outer/border problem, but IE6 needs an extra bit of space,
				// otherwise you can get text pushed down into a second line when icons are active
				controlWidth -= (controlIcon.outerWidth() + 4);
				controlText.css({ width: controlWidth + "px" });
			}
			// Account for padding, borders, etc
			controlWidth = controlWrapper.outerWidth();

			// the drop container height can be set from options
			var maxDropHeight = (options.maxDropHeight != null)
            					? parseInt(options.maxDropHeight)
            					: -1;
			var dropHeight = ((maxDropHeight > 0) && (dropCalculatedSize.height > maxDropHeight))
            					? maxDropHeight
            					: dropCalculatedSize.height;
			// ensure the drop container is not less than the control width (would be ugly)
			var dropWidth = dropCalculatedSize.width < controlWidth ? controlWidth : dropCalculatedSize.width;

			$(dropWrapper).css({
				height: dropHeight + "px",
				width: dropWidth + "px"
			});
			dropWrapper.find(".ui-dropdownchecklist-dropcontainer").css({
				height: dropHeight + "px"
			});
		},
		// Initializes the plugin
		_init: function () {
			var self = this, options = this.options;
			if ($.ui.dropdownchecklist.gIDCounter == null) {
				$.ui.dropdownchecklist.gIDCounter = 1;
			}
			// item blurring relies on a cancelable timer
			self.blurringItem = null;

			// sourceSelect is the select on which the plugin is applied
			var sourceSelect = self.element;
			self.initialDisplay = sourceSelect.css("display");
			sourceSelect.css("display", "none");
			self.initialMultiple = sourceSelect.prop("multiple");
			self.isMultiple = self.initialMultiple;
			if (options.forceMultiple != null) { self.isMultiple = options.forceMultiple; }
			sourceSelect.prop("multiple", true);
			self.sourceSelect = sourceSelect;

			// append the control that resembles a single selection select
			var controlWrapper = self._appendControl();
			self.controlWrapper = controlWrapper;
			self.controlSelector = controlWrapper.find(".ui-dropdownchecklist-selector");

			// create the drop container where the items are shown
			var dropWrapper = self._appendDropContainer(controlWrapper);
			self.dropWrapper = dropWrapper;

			// append the items from the source select element
			var dropCalculatedSize = self._appendItems();

			// updates the text shown in the control
			self._updateControlText(controlWrapper, dropWrapper, sourceSelect);

			// set the sizes of control and drop container
			self._setSize(dropCalculatedSize);

			// look for possible auto-check needed on first item
			if (options.firstItemChecksAll) {
				self._syncSelected(null);
			}
			// BGIFrame for IE6
			if (options.bgiframe && typeof self.dropWrapper.bgiframe == "function") {
				self.dropWrapper.bgiframe();
			}
			// listen for change events on the source select element
			// ensure we avoid processing internally triggered changes
			self.sourceSelect.change(function (event, eventName) {
				if (eventName != 'ddcl_internal') {
					self._sourceSelectChangeHandler(event);
				}
			});
		},
		// Refresh the disable and check state from the underlying control
		_refreshOption: function (item, disabled, selected) {
			var aParent = item.parent();
			// account for enabled/disabled
			if (disabled) {
				item.prop("disabled", true);
				item.removeClass("active");
				item.addClass("inactive");
				aParent.addClass("ui-state-disabled");
			} else {
				item.prop("disabled", false);
				item.removeClass("inactive");
				item.addClass("active");
				aParent.removeClass("ui-state-disabled");
			}
			// adjust the checkbox state
			item.prop("checked", selected);
		},
		_refreshGroup: function (group, disabled) {
			if (disabled) {
				group.addClass("ui-state-disabled");
			} else {
				group.removeClass("ui-state-disabled");
			}
		},
		// External command to explicitly close the dropdown
		close: function () {
			this._toggleDropContainer(false);
		},
		// External command to refresh the ddcl from the underlying selector
		refresh: function () {
			var self = this, sourceSelect = this.sourceSelect, dropWrapper = this.dropWrapper;

			var allCheckBoxes = dropWrapper.find("input");
			var allGroups = dropWrapper.find(".ui-dropdownchecklist-group");

			var groupCount = 0;
			var optionCount = 0;
			sourceSelect.children().each(function (index) {
				var opt = $(this);
				var disabled = opt.prop("disabled");
				if (opt.is("option")) {
					var selected = opt.prop("selected");
					var anItem = $(allCheckBoxes[optionCount]);
					self._refreshOption(anItem, disabled, selected);
					optionCount += 1;
				} else if (opt.is("optgroup")) {
					var text = opt.attr("label");
					if (text != "") {
						var aGroup = $(allGroups[groupCount]);
						self._refreshGroup(aGroup, disabled);
						groupCount += 1;
					}
					opt.children("option").each(function () {
						var subopt = $(this);
						var subdisabled = (disabled || subopt.prop("disabled"));
						var selected = subopt.prop("selected");
						var subItem = $(allCheckBoxes[optionCount]);
						self._refreshOption(subItem, subdisabled, selected);
						optionCount += 1;
					});
				}
			});
			// sync will handle firstItemChecksAll and updateControlText
			self._syncSelected(null);
		},
		// External command to enable the ddcl control
		enable: function () {
			this.controlSelector.removeClass("ui-state-disabled");
			this.disabled = false;
		},
		// External command to disable the ddcl control
		disable: function () {
			this.controlSelector.addClass("ui-state-disabled");
			this.disabled = true;
		},
		// External command to destroy all traces of the ddcl control
		destroy: function () {
			$.Widget.prototype.destroy.apply(this, arguments);
			this.sourceSelect.css("display", this.initialDisplay);
			this.sourceSelect.prop("multiple", this.initialMultiple);
			this.controlWrapper.unbind().remove();
			this.dropWrapper.remove();
		}
	});

	$.extend($.ui.dropdownchecklist, {
		defaults: {
			width: null
        , maxDropHeight: null
        , firstItemChecksAll: false
        , closeRadioOnClick: false
        , minWidth: 50
        , positionHow: 'absolute'
        , bgiframe: false
        , explicitClose: null
		}
	});

})(jQuery);

// *****************************************************************************************************
// Multiselect/js/plugins/scrollTo/jquery.scrollTo-min.js
// *****************************************************************************************************
; (function ($) { var m = $.scrollTo = function (b, h, f) { $(window).scrollTo(b, h, f) }; m.defaults = { axis: 'xy', duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1 }; m.window = function (b) { return $(window).scrollable() }; $.fn.scrollable = function () { return this.map(function () { var b = this, h = !b.nodeName || $.inArray(b.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1; if (!h) return b; var f = (b.contentWindow || b).document || b.ownerDocument || b; return $.browser.safari || f.compatMode == 'BackCompat' ? f.body : f.documentElement }) }; $.fn.scrollTo = function (l, j, a) { if (typeof j == 'object') { a = j; j = 0 } if (typeof a == 'function') a = { onAfter: a }; if (l == 'max') l = 9e9; a = $.extend({}, m.defaults, a); j = j || a.speed || a.duration; a.queue = a.queue && a.axis.length > 1; if (a.queue) j /= 2; a.offset = n(a.offset); a.over = n(a.over); return this.scrollable().each(function () { var k = this, o = $(k), d = l, p, g = {}, q = o.is('html,body'); switch (typeof d) { case 'number': case 'string': if (/^([+-]=)?\d+(\.\d+)?(px)?$/.test(d)) { d = n(d); break } d = $(d, this); case 'object': if (d.is || d.style) p = (d = $(d)).offset() } $.each(a.axis.split(''), function (b, h) { var f = h == 'x' ? 'Left' : 'Top', i = f.toLowerCase(), c = 'scroll' + f, r = k[c], s = h == 'x' ? 'Width' : 'Height'; if (p) { g[c] = p[i] + (q ? 0 : r - o.offset()[i]); if (a.margin) { g[c] -= parseInt(d.css('margin' + f)) || 0; g[c] -= parseInt(d.css('border' + f + 'Width')) || 0 } g[c] += a.offset[i] || 0; if (a.over[i]) g[c] += d[s.toLowerCase()]() * a.over[i] } else g[c] = d[i]; if (/^\d+$/.test(g[c])) g[c] = g[c] <= 0 ? 0 : Math.min(g[c], u(s)); if (!b && a.queue) { if (r != g[c]) t(a.onAfterFirst); delete g[c] } }); t(a.onAfter); function t(b) { o.animate(g, j, a.easing, b && function () { b.call(this, l, a) }) }; function u(b) { var h = 'scroll' + b; if (!q) return k[h]; var f = 'client' + b, i = k.ownerDocument.documentElement, c = k.ownerDocument.body; return Math.max(i[h], c[h]) - Math.min(i[f], c[f]) } }).end() }; function n(b) { return typeof b == 'object' ? b : { top: b, left: b } } })(jQuery);

// *****************************************************************************************************
// Multiselect/js/ui.multiselect.js
// *****************************************************************************************************
; (function ($) {

	$.widget("ui.multiselect", {
		options: {
			sortable: true,
			searchable: true,
			doubleClickable: true,
			animated: 'fast',
			show: 'slideDown',
			hide: 'slideUp',
			dividerLocation: 0.5,
			nodeComparator: function (node1, node2) {
				var text1 = node1.text(),
                    text2 = node2.text();
				return text1 == text2 ? 0 : (text1 < text2 ? -1 : 1);
			}
		},
		_create: function () {
			this.element.hide();
			this.id = this.element.attr("id");
			this.container = $('<div class="ui-multiselect ui-helper-clearfix ui-widget"></div>').insertAfter(this.element);
			this.count = 0; // number of currently selected options
			this.availableContainer = $('<div class="available"></div>').appendTo(this.container);
			this.selectedContainer = $('<div class="selected"></div>').appendTo(this.container);
			this.selectedActions = $('<div class="actions ui-widget-header ui-helper-clearfix"><span class="count">0 ' + $.ui.multiselect.locale.itemsCount + '</span><a href="#" class="remove-all">' + $.ui.multiselect.locale.removeAll + '</a></div>').appendTo(this.selectedContainer);
			this.availableActions = $('<div class="actions ui-widget-header ui-helper-clearfix"><input type="text" class="search empty ui-widget-content ui-corner-all"/><a href="#" class="add-all">' + $.ui.multiselect.locale.addAll + '</a></div>').appendTo(this.availableContainer);
			this.selectedList = $('<ul class="selected connected-list"><li class="ui-helper-hidden-accessible"></li></ul>').bind('selectstart', function () { return false; }).appendTo(this.selectedContainer);
			this.availableList = $('<ul class="available connected-list"><li class="ui-helper-hidden-accessible"></li></ul>').bind('selectstart', function () { return false; }).appendTo(this.availableContainer);

			var that = this;

			// set dimensions
			this.container.width(this.element.width() + 1);
			this.selectedContainer.width(Math.floor(this.element.width() * this.options.dividerLocation));
			this.availableContainer.width(Math.floor(this.element.width() * (1 - this.options.dividerLocation)));

			// fix list height to match <option> depending on their individual header's heights
			this.selectedList.height(Math.max(this.element.height() - this.selectedActions.height(), 1));
			this.availableList.height(Math.max(this.element.height() - this.availableActions.height(), 1));

			if (!this.options.animated) {
				this.options.show = 'show';
				this.options.hide = 'hide';
			}

			// init lists
			this._populateLists(this.element.find('option'));

			// make selection sortable
			if (this.options.sortable) {
				this.selectedList.sortable({
					placeholder: 'ui-state-highlight',
					axis: 'y',
					update: function (event, ui) {
						// apply the new sort order to the original selectbox
						that.selectedList.find('li').each(function () {
							if ($(this).data('optionLink'))
								$(this).data('optionLink').remove().appendTo(that.element);
						});
					},
					receive: function (event, ui) {
						ui.item.data('optionLink').attr('selected', true);
						// increment count
						that.count += 1;
						that._updateCount();
						// workaround, because there's no way to reference 
						// the new element, see http://dev.jqueryui.com/ticket/4303
						that.selectedList.children('.ui-draggable').each(function () {
							$(this).removeClass('ui-draggable');
							$(this).data('optionLink', ui.item.data('optionLink'));
							$(this).data('idx', ui.item.data('idx'));
							that._applyItemState($(this), true);
						});

						// workaround according to http://dev.jqueryui.com/ticket/4088
						setTimeout(function () { ui.item.remove(); }, 1);
					}
				});
			}

			// set up livesearch
			if (this.options.searchable) {
				this._registerSearchEvents(this.availableContainer.find('input.search'));
			} else {
				$('.search').hide();
			}

			// batch actions
			this.container.find(".remove-all").click(function () {
				that._populateLists(that.element.find('option').removeAttr('selected'));
				return false;
			});

			this.container.find(".add-all").click(function () {
				var options = that.element.find('option').not(":selected");
				if (that.availableList.children('li:hidden').length > 1) {
					that.availableList.children('li').each(function (i) {
						if ($(this).is(":visible")) $(options[i - 1]).attr('selected', 'selected');
					});
				} else {
					options.attr('selected', 'selected');
				}
				that._populateLists(that.element.find('option'));
				return false;
			});
		},
		destroy: function () {
			this.element.show();
			this.container.remove();

			$.Widget.prototype.destroy.apply(this, arguments);
		},
		_populateLists: function (options) {
			this.selectedList.children('.ui-element').remove();
			this.availableList.children('.ui-element').remove();
			this.count = 0;

			var that = this;
			var items = $(options.map(function (i) {
				var item = that._getOptionNode(this).appendTo(this.selected ? that.selectedList : that.availableList).show();

				if (this.selected) that.count += 1;
				that._applyItemState(item, this.selected);
				item.data('idx', i);
				return item[0];
			}));

			// update count
			this._updateCount();
			that._filter.apply(this.availableContainer.find('input.search'), [that.availableList]);
		},
		_updateCount: function () {
			this.selectedContainer.find('span.count').text(this.count + " " + $.ui.multiselect.locale.itemsCount);
		},
		_getOptionNode: function (option) {
			option = $(option);
			var node = $('<li class="ui-state-default ui-element" title="' + option.text() + '"><span class="ui-icon"/>' + option.text() + '<a href="#" class="action"><span class="ui-corner-all ui-icon"/></a></li>').hide();
			node.data('optionLink', option);
			return node;
		},
		// clones an item with associated data
		// didn't find a smarter away around this
		_cloneWithData: function (clonee) {
			var clone = clonee.clone(false, false);
			clone.data('optionLink', clonee.data('optionLink'));
			clone.data('idx', clonee.data('idx'));
			return clone;
		},
		_setSelected: function (item, selected) {
			item.data('optionLink').attr('selected', selected);

			if (selected) {
				var selectedItem = this._cloneWithData(item);
				item[this.options.hide](this.options.animated, function () { $(this).remove(); });
				selectedItem.appendTo(this.selectedList).hide()[this.options.show](this.options.animated);

				this._applyItemState(selectedItem, true);
				return selectedItem;
			} else {

				// look for successor based on initial option index
				var items = this.availableList.find('li'), comparator = this.options.nodeComparator;
				var succ = null, i = item.data('idx'), direction = comparator(item, $(items[i]));

				// TODO: test needed for dynamic list populating
				if (direction) {
					while (i >= 0 && i < items.length) {
						direction > 0 ? i++ : i--;
						if (direction != comparator(item, $(items[i]))) {
							// going up, go back one item down, otherwise leave as is
							succ = items[direction > 0 ? i : i + 1];
							break;
						}
					}
				} else {
					succ = items[i];
				}

				var availableItem = this._cloneWithData(item);
				succ ? availableItem.insertBefore($(succ)) : availableItem.appendTo(this.availableList);
				item[this.options.hide](this.options.animated, function () { $(this).remove(); });
				availableItem.hide()[this.options.show](this.options.animated);

				this._applyItemState(availableItem, false);
				return availableItem;
			}
		},
		_applyItemState: function (item, selected) {
			if (selected) {
				if (this.options.sortable)
					item.children('span').addClass('ui-icon-arrowthick-2-n-s').removeClass('ui-helper-hidden').addClass('ui-icon');
				else
					item.children('span').removeClass('ui-icon-arrowthick-2-n-s').addClass('ui-helper-hidden').removeClass('ui-icon');
				item.find('a.action span').addClass('ui-icon-minus').removeClass('ui-icon-plus');
				this._registerRemoveEvents(item.find('a.action'));

			} else {
				item.children('span').removeClass('ui-icon-arrowthick-2-n-s').addClass('ui-helper-hidden').removeClass('ui-icon');
				item.find('a.action span').addClass('ui-icon-plus').removeClass('ui-icon-minus');
				this._registerAddEvents(item.find('a.action'));
			}

			this._registerDoubleClickEvents(item);
			this._registerHoverEvents(item);
		},
		// taken from John Resig's liveUpdate script
		_filter: function (list) {
			var input = $(this);
			var rows = list.children('li'),
                cache = rows.map(function () {

                	return $(this).text().toLowerCase();
                });

			var term = $.trim(input.val().toLowerCase()), scores = [];

			if (!term) {
				rows.show();
			} else {
				rows.hide();

				cache.each(function (i) {
					if (this.indexOf(term) > -1) { scores.push(i); }
				});

				$.each(scores, function () {
					$(rows[this]).show();
				});
			}
		},
		_registerDoubleClickEvents: function (elements) {
			if (!this.options.doubleClickable) return;
			elements.dblclick(function () {
				elements.find('a.action').click();
			});
		},
		_registerHoverEvents: function (elements) {
			elements.removeClass('ui-state-hover');
			elements.mouseover(function () {
				$(this).addClass('ui-state-hover');
			});
			elements.mouseout(function () {
				$(this).removeClass('ui-state-hover');
			});
		},
		_registerAddEvents: function (elements) {
			var that = this;
			elements.click(function () {
				var item = that._setSelected($(this).parent(), true);
				that.count += 1;
				that._updateCount();
				return false;
			});

			// make draggable
			if (this.options.sortable) {
				elements.each(function () {
					$(this).parent().draggable({
						connectToSortable: that.selectedList,
						helper: function () {
							var selectedItem = that._cloneWithData($(this)).width($(this).width() - 50);
							selectedItem.width($(this).width());
							return selectedItem;
						},
						appendTo: that.container,
						containment: that.container,
						revert: 'invalid'
					});
				});
			}
		},
		_registerRemoveEvents: function (elements) {
			var that = this;
			elements.click(function () {
				that._setSelected($(this).parent(), false);
				that.count -= 1;
				that._updateCount();
				return false;
			});
		},
		_registerSearchEvents: function (input) {
			var that = this;

			input.focus(function () {
				$(this).addClass('ui-state-active');
			})
            .blur(function () {
            	$(this).removeClass('ui-state-active');
            })
            .keypress(function (e) {
            	if (e.keyCode == 13)
            		return false;
            })
            .keyup(function () {
            	that._filter.apply(this, [that.availableList]);
            });
		}
	});

	$.extend($.ui.multiselect, {
		locale: {
			addAll: 'Add all',
			removeAll: 'Remove all',
			itemsCount: 'items selected'
		}
	});
})(jQuery);

/*!
 CLEditor WYSIWYG HTML Editor v1.4.4
 http://premiumsoftware.net/CLEditor
 requires jQuery v1.4.2 or later
 Copyright 2010, Chris Landowski, Premium Software, LLC
 Dual licensed under the MIT or GPL Version 2 licenses.
*/
(function (n) { function vi(t) { var i = this, v = t.target, p = n.data(v, a), w = o[p], k = w.popupName, g = f[k], y, d; if (!i.disabled && n(v).attr(r) !== r) { if (y = { editor: i, button: v, buttonName: p, popup: g, popupName: k, command: w.command, useCSS: i.options.useCSS }, w.buttonClick && w.buttonClick(t, y) === !1) return !1; if (p === "source") l(i) ? (delete i.range, i.$area.hide(), i.$frame.show(), v.title = w.title) : (i.$frame.hide(), i.$area.show(), v.title = "Show Rich Text"), setTimeout(function () { c(i) }, 100); else if (!l(i)) { if (k) { if (d = n(g), k === "url") { if (p === "link" && ri(i) === "") return rt(i, "A selection is required when inserting a link.", v), !1; d.children(":button").unbind(u).bind(u, function () { var t = d.find(":text"), r = n.trim(t.val()); r !== "" && s(i, y.command, r, null, y.button); t.val("http://"); e(); h(i) }) } else k === "pastetext" && d.children(":button").unbind(u).bind(u, function () { var n = d.find("textarea"), t = n.val().replace(/\n/g, "<br />"); t !== "" && s(i, y.command, t, null, y.button); n.val(""); e(); h(i) }); return v !== n.data(g, b) ? (ui(i, g, v), !1) : void 0 } if (p === "print") i.$frame[0].contentWindow.print(); else if (!s(i, y.command, y.value, y.useCSS, v)) return !1 } h(i) } } function kt(t) { var i = n(t.target).closest("div"); i.css(ft, i.data(a) ? "#FFF" : "#FFC") } function dt(t) { n(t.target).closest("div").css(ft, "transparent") } function yi(i) { var v = this, y = i.data.popup, r = i.target, l; if (y !== f.msg && !n(y).hasClass(g)) { var w = n.data(y, b), u = n.data(w, a), p = o[u], k = p.command, c, d = v.options.useCSS; if (u === "font" ? c = r.style.fontFamily.replace(/"/g, "") : u === "size" ? (r.tagName.toUpperCase() === "DIV" && (r = r.children[0]), c = r.innerHTML) : u === "style" ? c = "<" + r.tagName + ">" : u === "color" ? c = ti(r.style.backgroundColor) : u === "highlight" && (c = ti(r.style.backgroundColor), t ? k = "backcolor" : d = !0), l = { editor: v, button: w, buttonName: u, popup: y, popupName: p.popupName, command: k, value: c, useCSS: d }, !p.popupClick || p.popupClick(i, l) !== !1) { if (l.command && !s(v, l.command, l.value, l.useCSS, w)) return !1; e(); h(v) } } } function nt(n) { for (var t = 1, i = 0, r = 0; r < n.length; ++r) t = (t + n.charCodeAt(r)) % 65521, i = (i + t) % 65521; return i << 16 | t } function pi(n) { n.$area.val(""); ut(n) } function gt(r, u, e, o, s) { var h, c; return f[r] ? f[r] : (h = n(i).hide().addClass(si).appendTo("body"), o ? h.html(o) : r === "color" ? (c = u.colors.split(" "), c.length < 10 && h.width("auto"), n.each(c, function (t, r) { n(i).appendTo(h).css(ft, "#" + r) }), e = hi) : r === "font" ? n.each(u.fonts.split(","), function (t, r) { n(i).appendTo(h).css("fontFamily", r).html(r) }) : r === "size" ? n.each(u.sizes.split(","), function (t, r) { n(i).appendTo(h).html('<font size="' + r + '">' + r + "<\/font>") }) : r === "style" ? n.each(u.styles, function (t, r) { n(i).appendTo(h).html(r[1] + r[0] + r[1].replace("<", "<\/")) }) : r === "url" ? (h.html('Enter URL:<br /><input type="text" value="http://" size="35" /><br /><input type="button" value="Submit" />'), e = g) : r === "pastetext" && (h.html('Paste your content here and click submit.<br /><textarea cols="40" rows="3"><\/textarea><br /><input type="button" value="Submit" />'), e = g), e || o || (e = pt), h.addClass(e), t && h.attr(et, "on").find("div,font,p,h1,h2,h3,h4,h5,h6").attr(et, "on"), (h.hasClass(pt) || s === !0) && h.children().hover(kt, dt), f[r] = h[0], h[0]) } function ni(n, i) { i ? (n.$area.attr(r, r), n.disabled = !0) : (n.$area.removeAttr(r), delete n.disabled); try { t ? n.doc.body.contentEditable = !i : n.doc.designMode = i ? "off" : "on" } catch (u) { } c(n) } function s(n, i, r, u, f) { it(n); t || ((u === undefined || u === null) && (u = n.options.useCSS), n.doc.execCommand("styleWithCSS", 0, u.toString())); var e = !0, o; if (t && i.toLowerCase() === "inserthtml") p(n).pasteHTML(r); else { try { e = n.doc.execCommand(i, 0, r || null) } catch (s) { o = s.message; e = !1 } e || ("cutcopypaste".indexOf(i) > -1 ? rt(n, "For security reasons, your browser does not support the " + i + " command. Try using the keyboard shortcut or context menu instead.", f) : rt(n, o ? o : "Error executing the " + i + " command.", f)) } return c(n), ct(n, !0), e } function h(n) { setTimeout(function () { l(n) ? n.$area.focus() : n.$frame[0].contentWindow.focus(); c(n) }, 0) } function p(n) { return t ? tt(n).createRange() : tt(n).getRangeAt(0) } function tt(n) { return t ? n.doc.selection : n.$frame[0].contentWindow.getSelection() } function ti(n) { var i = /rgba?\((\d+), (\d+), (\d+)/.exec(n), t; if (i) { for (n = (i[1] << 16 | i[2] << 8 | i[3]).toString(16) ; n.length < 6;) n = "0" + n; return "#" + n } return (t = n.split(""), n.length === 4) ? "#" + t[1] + t[1] + t[2] + t[2] + t[3] + t[3] : n } function e() { n.each(f, function (t, i) { n(i).hide().unbind(u).removeData(b) }) } function ii() { var t = n("link[href*=cleditor]").attr("href"); return t.replace(/^(.*\/)[^\/]+$/, "$1") + "images/" } function wi(n) { return "url(" + ii() + n + ")" } function ht(i) { var o = i.$main, r = i.options; i.$frame && i.$frame.remove(); var u = i.$frame = n('<iframe frameborder="0" src="javascript:true;" />').hide().appendTo(o), l = u[0].contentWindow, f = i.doc = l.document, s = n(f); f.open(); f.write(r.docType + "<html>" + (r.docCSSFile === "" ? "" : '<head><link rel="stylesheet" type="text/css" href="' + r.docCSSFile + '" /><\/head>') + '<body style="' + r.bodyStyle + '"><\/body><\/html>'); f.close(); (t || ot) && s.click(function () { h(i) }); ut(i); t || ot ? (s.bind("beforedeactivate beforeactivate selectionchange keypress", function (n) { if (n.type === "beforedeactivate") i.inactive = !0; else if (n.type === "beforeactivate") !i.inactive && i.range && i.range.length > 1 && i.range.shift(), delete i.inactive; else if (!i.inactive) for (i.range || (i.range = []), i.range.unshift(p(i)) ; i.range.length > 2;) i.range.pop() }), u.focus(function () { it(i); n(i).triggerHandler(d) }), u.blur(function () { n(i).triggerHandler(w) })) : n(i.$frame[0].contentWindow).focus(function () { n(i).triggerHandler(d) }).blur(function () { n(i).triggerHandler(w) }); s.click(e).bind("keyup mouseup", function () { c(i); ct(i, !0) }); st ? i.$area.show() : u.show(); n(function () { var t = i.$toolbar, f = t.children("div:last"), e = o.width(), n = f.offset().top + f.outerHeight() - t.offset().top + 1; t.height(n); n = (/%/.test("" + r.height) ? o.height() : parseInt(r.height, 10)) - n; u.width(e).height(n); i.$area.width(e).height(li ? n - 2 : n); ni(i, i.disabled); c(i) }) } function c(i) { var u, e; st || !ai || i.focused || (i.$frame[0].contentWindow.focus(), window.focus(), i.focused = !0); u = i.doc; t && (u = p(i)); e = l(i); n.each(i.$toolbar.find("." + vt), function (o, s) { var v = n(s), h = n.cleditor.buttons[n.data(s, a)], c = h.command, l = !0, y; if (i.disabled) l = !1; else if (h.getEnabled) y = { editor: i, button: s, buttonName: h.name, popup: f[h.popupName], popupName: h.popupName, command: h.command, useCSS: i.options.useCSS }, l = h.getEnabled(y), l === undefined && (l = !0); else if ((e || st) && h.name !== "source" || t && (c === "undo" || c === "redo")) l = !1; else if (c && c !== "print" && (t && c === "hilitecolor" && (c = "backcolor"), !t || c !== "inserthtml")) try { l = u.queryCommandEnabled(c) } catch (p) { l = !1 } l ? (v.removeClass(yt), v.removeAttr(r)) : (v.addClass(yt), v.attr(r, r)) }) } function it(n) { n.range && (t ? n.range[0].select() : ot && tt(n).addRange(n.range[0])) } function bi(n) { setTimeout(function () { l(n) ? n.$area.select() : s(n, "selectall") }, 0) } function ki(i) { var u, r, f; return (it(i), u = p(i), t) ? u.htmlText : (r = n("<layer>")[0], r.appendChild(u.cloneContents()), f = r.innerHTML, r = null, f) } function ri(n) { return (it(n), t) ? p(n).text : tt(n).toString() } function rt(n, t, i) { var r = gt("msg", n.options, ci); r.innerHTML = t; ui(n, r, i) } function ui(t, i, r) { var f, h, c, o = n(i), l, s; r ? (l = n(r), f = l.offset(), h = --f.left, c = f.top + l.height()) : (s = t.$toolbar, f = s.offset(), h = Math.floor((s.width() - o.width()) / 2) + f.left, c = f.top + s.height() - 2); e(); o.css({ left: h, top: c }).show(); r && (n.data(i, b, r), o.bind(u, { popup: i }, n.proxy(yi, t))); setTimeout(function () { o.find(":text,textarea").eq(0).focus().select() }, 100) } function l(n) { return n.$area.is(":visible") } function ut(t, i) { var u = t.$area.val(), o = t.options, f = o.updateFrame, s = n(t.doc.body), e, r; if (f) { if (e = nt(u), i && t.areaChecksum === e) return; t.areaChecksum = e } r = f ? f(u) : u; r = r.replace(/<(?=\/?script)/ig, "&lt;"); o.updateTextArea && (t.frameChecksum = nt(r)); r !== s.html() && (s.html(r), n(t).triggerHandler(k)) } function ct(t, i) { var u = n(t.doc.body).html(), o = t.options, f = o.updateTextArea, s = t.$area, e, r; if (f) { if (e = nt(u), i && t.frameChecksum === e) return; t.frameChecksum = e } r = f ? f(u) : u; o.updateFrame && (t.areaChecksum = nt(r)); r !== s.val() && (s.val(r), n(t).triggerHandler(k)) } var y, bt; n.cleditor = { defaultOptions: { width: "auto", height: 250, controls: "bold italic underline strikethrough subscript superscript | font size style | color highlight removeformat | bullets numbering | outdent indent | alignleft center alignright justify | undo redo | rule image link unlink | cut copy paste pastetext | print source", colors: "FFF FCC FC9 FF9 FFC 9F9 9FF CFF CCF FCF CCC F66 F96 FF6 FF3 6F9 3FF 6FF 99F F9F BBB F00 F90 FC6 FF0 3F3 6CC 3CF 66C C6C 999 C00 F60 FC3 FC0 3C0 0CC 36F 63F C3C 666 900 C60 C93 990 090 399 33F 60C 939 333 600 930 963 660 060 366 009 339 636 000 300 630 633 330 030 033 006 309 303", fonts: "Arial,Arial Black,Comic Sans MS,Courier New,Narrow,Garamond,Georgia,Impact,Sans Serif,Serif,Tahoma,Trebuchet MS,Verdana", sizes: "1,2,3,4,5,6,7", styles: [["Paragraph", "<p>"], ["Header 1", "<h1>"], ["Header 2", "<h2>"], ["Header 3", "<h3>"], ["Header 4", "<h4>"], ["Header 5", "<h5>"], ["Header 6", "<h6>"]], useCSS: !0, docType: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">', docCSSFile: "", bodyStyle: "margin:4px; font:10pt Arial,Verdana; cursor:text" }, buttons: { init: "bold,,|italic,,|underline,,|strikethrough,,|subscript,,|superscript,,|font,,fontname,|size,Font Size,fontsize,|style,,formatblock,|color,Font Color,forecolor,|highlight,Text Highlight Color,hilitecolor,color|removeformat,Remove Formatting,|bullets,,insertunorderedlist|numbering,,insertorderedlist|outdent,,|indent,,|alignleft,Align Text Left,justifyleft|center,,justifycenter|alignright,Align Text Right,justifyright|justify,,justifyfull|undo,,|redo,,|rule,Insert Horizontal Rule,inserthorizontalrule|image,Insert Image,insertimage,url|link,Insert Hyperlink,createlink,url|unlink,Remove Hyperlink,|cut,,|copy,,|paste,,|pastetext,Paste as Text,inserthtml,|print,,|source,Show Source" }, imagesPath: function () { return ii() } }; n.fn.cleditor = function (t) { var i = n([]); return this.each(function (r, u) { if (u.tagName.toUpperCase() === "TEXTAREA") { var f = n.data(u, lt); f || (f = new cleditor(u, t)); i = i.add(f) } }), i }; var ft = "backgroundColor", w = "blurred", b = "button", a = "buttonName", k = "change", lt = "cleditor", u = "click", r = "disabled", i = "<div>", d = "focused", et = "unselectable", fi = "cleditorMain", ei = "cleditorToolbar", at = "cleditorGroup", vt = "cleditorButton", yt = "cleditorDisabled", oi = "cleditorDivider", si = "cleditorPopup", pt = "cleditorList", hi = "cleditorColor", g = "cleditorPrompt", ci = "cleditorMsg", v = navigator.userAgent.toLowerCase(), t = /msie/.test(v), li = /msie\s6/.test(v), ot = /(trident)(?:.*rv:([\w.]+))?/.test(v), ai = /webkit/.test(v), st = /iphone|ipad|ipod/i.test(v), f = {}, wt, o = n.cleditor.buttons; n.each(o.init.split("|"), function (n, t) { var i = t.split(","), r = i[0]; o[r] = { stripIndex: n, name: r, title: i[1] === "" ? r.charAt(0).toUpperCase() + r.substr(1) : i[1], command: i[2] === "" ? r : i[2], popupName: i[3] === "" ? r : i[3] } }); delete o.init; cleditor = function (r, f) { var s = this; s.options = f = n.extend({}, n.cleditor.defaultOptions, f); var l = s.$area = n(r).hide().data(lt, s).blur(function () { ut(s, !0) }), v = s.$main = n(i).addClass(fi).width(f.width).height(f.height), y = s.$toolbar = n(i).addClass(ei).appendTo(v), h = n(i).addClass(at).appendTo(y), c = 0; n.each(f.controls.split(" "), function (r, e) { var w, l, p, v; if (e === "") return !0; e === "|" ? (w = n(i).addClass(oi).appendTo(h), h.width(c + 1), c = 0, h = n(i).addClass(at).appendTo(y)) : (l = o[e], p = n(i).data(a, l.name).addClass(vt).attr("title", l.title).bind(u, n.proxy(vi, s)).appendTo(h).hover(kt, dt), c += 24, h.width(c + 1), v = {}, l.css ? v = l.css : l.image && (v.backgroundImage = wi(l.image)), l.stripIndex && (v.backgroundPosition = l.stripIndex * -24), p.css(v), t && p.attr(et, "on"), l.popupName && gt(l.popupName, f, l.popupClass, l.popupContent, l.popupHover)) }); v.insertBefore(l).append(l); wt || (n(document).click(function (t) { var i = n(t.target); i.add(i.parents()).is("." + g) || e() }), wt = !0); /auto|%/.test("" + f.width + f.height) && n(window).bind("resize.cleditor", function () { ht(s) }); ht(s) }; y = cleditor.prototype; bt = [["clear", pi], ["disable", ni], ["execCommand", s], ["focus", h], ["hidePopups", e], ["sourceMode", l, !0], ["refresh", ht], ["select", bi], ["selectedHTML", ki, !0], ["selectedText", ri, !0], ["showMessage", rt], ["updateFrame", ut], ["updateTextArea", ct]]; n.each(bt, function (n, t) { y[t[0]] = function () { for (var u, n = this, r = [n], i = 0; i < arguments.length; i++) r.push(arguments[i]); return (u = t[1].apply(n, r), t[2]) ? u : n } }); y.blurred = function (t) { var i = n(this); return t ? i.bind(w, t) : i.trigger(w) }; y.change = function (t) { console.log("change test"); var i = n(this); return t ? i.bind(k, t) : i.trigger(k) }; y.focused = function (t) { var i = n(this); return t ? i.bind(d, t) : i.trigger(d) } })(jQuery);

// *****************************************************************************************************
// jquery-ui-timepicker-addon.js
// *****************************************************************************************************
(function ($) {

	$.extend($.ui, { timepicker: { version: "0.9.9" } });

	/* Time picker manager.
	Use the singleton instance of this class, $.timepicker, to interact with the time picker.
	Settings for (groups of) time pickers are maintained in an instance object,
	allowing multiple different settings on the same page. */

	function Timepicker() {
		this.regional = []; // Available regional settings, indexed by language code
		this.regional[''] = { // Default regional settings
			currentText: 'Now',
			closeText: 'Done',
			ampm: false,
			amNames: ['AM', 'A'],
			pmNames: ['PM', 'P'],
			timeFormat: 'hh:mm tt',
			timeSuffix: '',
			timeOnlyTitle: 'Choose Time',
			timeText: 'Time',
			hourText: 'Hour',
			minuteText: 'Minute',
			secondText: 'Second',
			millisecText: 'Millisecond',
			timezoneText: 'Time Zone'
		};
		this._defaults = { // Global defaults for all the datetime picker instances
			showButtonPanel: true,
			timeOnly: false,
			showHour: true,
			showMinute: true,
			showSecond: false,
			showMillisec: false,
			showTimezone: false,
			showTime: true,
			stepHour: 1,
			stepMinute: 1,
			stepSecond: 1,
			stepMillisec: 1,
			hour: 0,
			minute: 0,
			second: 0,
			millisec: 0,
			timezone: '+0000',
			hourMin: 0,
			minuteMin: 0,
			secondMin: 0,
			millisecMin: 0,
			hourMax: 23,
			minuteMax: 59,
			secondMax: 59,
			millisecMax: 999,
			minDateTime: null,
			maxDateTime: null,
			onSelect: null,
			hourGrid: 0,
			minuteGrid: 0,
			secondGrid: 0,
			millisecGrid: 0,
			alwaysSetTime: true,
			separator: ' ',
			altFieldTimeOnly: true,
			showTimepicker: true,
			timezoneIso8609: false,
			timezoneList: null,
			addSliderAccess: false,
			sliderAccessArgs: null
		};
		$.extend(this._defaults, this.regional['']);
	};

	$.extend(Timepicker.prototype, {
		$input: null,
		$altInput: null,
		$timeObj: null,
		inst: null,
		hour_slider: null,
		minute_slider: null,
		second_slider: null,
		millisec_slider: null,
		timezone_select: null,
		hour: 0,
		minute: 0,
		second: 0,
		millisec: 0,
		timezone: '+0000',
		hourMinOriginal: null,
		minuteMinOriginal: null,
		secondMinOriginal: null,
		millisecMinOriginal: null,
		hourMaxOriginal: null,
		minuteMaxOriginal: null,
		secondMaxOriginal: null,
		millisecMaxOriginal: null,
		ampm: '',
		formattedDate: '',
		formattedTime: '',
		formattedDateTime: '',
		timezoneList: null,

		/* Override the default settings for all instances of the time picker.
		@param  settings  object - the new settings to use as defaults (anonymous object)
		@return the manager object */
		setDefaults: function (settings) {
			extendRemove(this._defaults, settings || {});
			return this;
		},

		//########################################################################
		// Create a new Timepicker instance
		//########################################################################
		_newInst: function ($input, o) {
			var tp_inst = new Timepicker(),
			inlineSettings = {};

			for (var attrName in this._defaults) {
				var attrValue = $input.attr('time:' + attrName);
				if (attrValue) {
					try {
						inlineSettings[attrName] = eval(attrValue);
					} catch (err) {
						inlineSettings[attrName] = attrValue;
					}
				}
			}
			tp_inst._defaults = $.extend({}, this._defaults, inlineSettings, o, {
				beforeShow: function (input, dp_inst) {
					if ($.isFunction(o.beforeShow))
						return o.beforeShow(input, dp_inst, tp_inst);
				},
				onChangeMonthYear: function (year, month, dp_inst) {
					// Update the time as well : this prevents the time from disappearing from the $input field.
					tp_inst._updateDateTime(dp_inst);
					if ($.isFunction(o.onChangeMonthYear))
						o.onChangeMonthYear.call($input[0], year, month, dp_inst, tp_inst);
				},
				onClose: function (dateText, dp_inst) {
					if (tp_inst.timeDefined === true && $input.val() != '')
						tp_inst._updateDateTime(dp_inst);
					if ($.isFunction(o.onClose))
						o.onClose.call($input[0], dateText, dp_inst, tp_inst);
				},
				timepicker: tp_inst // add timepicker as a property of datepicker: $.datepicker._get(dp_inst, 'timepicker');
			});
			tp_inst.amNames = $.map(tp_inst._defaults.amNames, function (val) { return val.toUpperCase() });
			tp_inst.pmNames = $.map(tp_inst._defaults.pmNames, function (val) { return val.toUpperCase() });

			if (tp_inst._defaults.timezoneList === null) {
				var timezoneList = [];
				for (var i = -11; i <= 12; i++)
					timezoneList.push((i >= 0 ? '+' : '-') + ('0' + Math.abs(i).toString()).slice(-2) + '00');
				if (tp_inst._defaults.timezoneIso8609)
					timezoneList = $.map(timezoneList, function (val) {
						return val == '+0000' ? 'Z' : (val.substring(0, 3) + ':' + val.substring(3));
					});
				tp_inst._defaults.timezoneList = timezoneList;
			}

			tp_inst.hour = tp_inst._defaults.hour;
			tp_inst.minute = tp_inst._defaults.minute;
			tp_inst.second = tp_inst._defaults.second;
			tp_inst.millisec = tp_inst._defaults.millisec;
			tp_inst.ampm = '';
			tp_inst.$input = $input;

			if (o.altField)
				tp_inst.$altInput = $(o.altField)
				.css({ cursor: 'pointer' })
				.focus(function () { $input.trigger("focus"); });

			if (tp_inst._defaults.minDate == 0 || tp_inst._defaults.minDateTime == 0) {
				tp_inst._defaults.minDate = new Date();
			}
			if (tp_inst._defaults.maxDate == 0 || tp_inst._defaults.maxDateTime == 0) {
				tp_inst._defaults.maxDate = new Date();
			}

			// datepicker needs minDate/maxDate, timepicker needs minDateTime/maxDateTime..
			if (tp_inst._defaults.minDate !== undefined && tp_inst._defaults.minDate instanceof Date)
				tp_inst._defaults.minDateTime = new Date(tp_inst._defaults.minDate.getTime());
			if (tp_inst._defaults.minDateTime !== undefined && tp_inst._defaults.minDateTime instanceof Date)
				tp_inst._defaults.minDate = new Date(tp_inst._defaults.minDateTime.getTime());
			if (tp_inst._defaults.maxDate !== undefined && tp_inst._defaults.maxDate instanceof Date)
				tp_inst._defaults.maxDateTime = new Date(tp_inst._defaults.maxDate.getTime());
			if (tp_inst._defaults.maxDateTime !== undefined && tp_inst._defaults.maxDateTime instanceof Date)
				tp_inst._defaults.maxDate = new Date(tp_inst._defaults.maxDateTime.getTime());
			return tp_inst;
		},

		//########################################################################
		// add our sliders to the calendar
		//########################################################################
		_addTimePicker: function (dp_inst) {
			var currDT = (this.$altInput && this._defaults.altFieldTimeOnly) ?
				this.$input.val() + ' ' + this.$altInput.val() :
				this.$input.val();

			this.timeDefined = this._parseTime(currDT);
			this._limitMinMaxDateTime(dp_inst, false);
			this._injectTimePicker();
		},

		//########################################################################
		// parse the time string from input value or _setTime
		//########################################################################
		_parseTime: function (timeString, withDate) {
			var regstr = this._defaults.timeFormat.toString()
				.replace(/h{1,2}/ig, '(\\d?\\d)')
				.replace(/m{1,2}/ig, '(\\d?\\d)')
				.replace(/s{1,2}/ig, '(\\d?\\d)')
				.replace(/l{1}/ig, '(\\d?\\d?\\d)')
				.replace(/t{1,2}/ig, this._getPatternAmpm())
				.replace(/z{1}/ig, '(z|[-+]\\d\\d:?\\d\\d)?')
				.replace(/\s/g, '\\s?') + this._defaults.timeSuffix + '$',
			order = this._getFormatPositions(),
			ampm = '',
			treg;

			if (!this.inst) this.inst = $.datepicker._getInst(this.$input[0]);

			if (withDate || !this._defaults.timeOnly) {
				// the time should come after x number of characters and a space.
				// x = at least the length of text specified by the date format
				var dp_dateFormat = $.datepicker._get(this.inst, 'dateFormat');
				// escape special regex characters in the seperator
				var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");
				regstr = '^.{' + dp_dateFormat.length + ',}?' + this._defaults.separator.replace(specials, "\\$&") + regstr;
			}

			treg = timeString.match(new RegExp(regstr, 'i'));

			if (treg) {
				if (order.t !== -1) {
					if (treg[order.t] === undefined || treg[order.t].length === 0) {
						ampm = '';
						this.ampm = '';
					} else {
						ampm = $.inArray(treg[order.t].toUpperCase(), this.amNames) !== -1 ? 'AM' : 'PM';
						this.ampm = this._defaults[ampm == 'AM' ? 'amNames' : 'pmNames'][0];
					}
				}

				if (order.h !== -1) {
					if (ampm == 'AM' && treg[order.h] == '12')
						this.hour = 0; // 12am = 0 hour
					else if (ampm == 'PM' && treg[order.h] != '12')
						this.hour = (parseFloat(treg[order.h]) + 12).toFixed(0); // 12pm = 12 hour, any other pm = hour + 12
					else this.hour = Number(treg[order.h]);
				}

				if (order.m !== -1) this.minute = Number(treg[order.m]);
				if (order.s !== -1) this.second = Number(treg[order.s]);
				if (order.l !== -1) this.millisec = Number(treg[order.l]);
				if (order.z !== -1 && treg[order.z] !== undefined) {
					var tz = treg[order.z].toUpperCase();
					switch (tz.length) {
						case 1: // Z
							tz = this._defaults.timezoneIso8609 ? 'Z' : '+0000';
							break;
						case 5: // +hhmm
							if (this._defaults.timezoneIso8609)
								tz = tz.substring(1) == '0000'
						   ? 'Z'
						   : tz.substring(0, 3) + ':' + tz.substring(3);
							break;
						case 6: // +hh:mm
							if (!this._defaults.timezoneIso8609)
								tz = tz == 'Z' || tz.substring(1) == '00:00'
						   ? '+0000'
						   : tz.replace(/:/, '');
							else if (tz.substring(1) == '00:00')
								tz = 'Z';
							break;
					}
					this.timezone = tz;
				}

				return true;

			}
			return false;
		},

		//########################################################################
		// pattern for standard and localized AM/PM markers
		//########################################################################
		_getPatternAmpm: function () {
			var markers = [];
			o = this._defaults;
			if (o.amNames)
				$.merge(markers, o.amNames);
			if (o.pmNames)
				$.merge(markers, o.pmNames);
			markers = $.map(markers, function (val) { return val.replace(/[.*+?|()\[\]{}\\]/g, '\\$&') });
			return '(' + markers.join('|') + ')?';
		},

		//########################################################################
		// figure out position of time elements.. cause js cant do named captures
		//########################################################################
		_getFormatPositions: function () {
			var finds = this._defaults.timeFormat.toLowerCase().match(/(h{1,2}|m{1,2}|s{1,2}|l{1}|t{1,2}|z)/g),
			orders = { h: -1, m: -1, s: -1, l: -1, t: -1, z: -1 };

			if (finds)
				for (var i = 0; i < finds.length; i++)
					if (orders[finds[i].toString().charAt(0)] == -1)
						orders[finds[i].toString().charAt(0)] = i + 1;

			return orders;
		},

		//########################################################################
		// generate and inject html for timepicker into ui datepicker
		//########################################################################
		_injectTimePicker: function () {
			var $dp = this.inst.dpDiv,
			o = this._defaults,
			tp_inst = this,
			// Added by Peter Medeiros:
			// - Figure out what the hour/minute/second max should be based on the step values.
			// - Example: if stepMinute is 15, then minMax is 45.
			hourMax = parseInt((o.hourMax - ((o.hourMax - o.hourMin) % o.stepHour)), 10),
			minMax = parseInt((o.minuteMax - ((o.minuteMax - o.minuteMin) % o.stepMinute)), 10),
			secMax = parseInt((o.secondMax - ((o.secondMax - o.secondMin) % o.stepSecond)), 10),
			millisecMax = parseInt((o.millisecMax - ((o.millisecMax - o.millisecMin) % o.stepMillisec)), 10),
			dp_id = this.inst.id.toString().replace(/([^A-Za-z0-9_])/g, '');

			// Prevent displaying twice
			//if ($dp.find("div#ui-timepicker-div-"+ dp_id).length === 0) {
			if ($dp.find("div#ui-timepicker-div-" + dp_id).length === 0 && o.showTimepicker) {
				var noDisplay = ' style="display:none;"',
				html = '<div class="ui-timepicker-div" id="ui-timepicker-div-' + dp_id + '"><dl>' +
						'<dt class="ui_tpicker_time_label" id="ui_tpicker_time_label_' + dp_id + '"' +
						((o.showTime) ? '' : noDisplay) + '>' + o.timeText + '</dt>' +
						'<dd class="ui_tpicker_time" id="ui_tpicker_time_' + dp_id + '"' +
						((o.showTime) ? '' : noDisplay) + '></dd>' +
						'<dt class="ui_tpicker_hour_label" id="ui_tpicker_hour_label_' + dp_id + '"' +
						((o.showHour) ? '' : noDisplay) + '>' + o.hourText + '</dt>',
				hourGridSize = 0,
				minuteGridSize = 0,
				secondGridSize = 0,
				millisecGridSize = 0,
				size;

				// Hours
				html += '<dd class="ui_tpicker_hour"><div id="ui_tpicker_hour_' + dp_id + '"' +
						((o.showHour) ? '' : noDisplay) + '></div>';
				if (o.showHour && o.hourGrid > 0) {
					html += '<div style="padding-left: 1px"><table class="ui-tpicker-grid-label"><tr>';

					for (var h = o.hourMin; h <= hourMax; h += parseInt(o.hourGrid, 10)) {
						hourGridSize++;
						var tmph = (o.ampm && h > 12) ? h - 12 : h;
						if (tmph < 10) tmph = '0' + tmph;
						if (o.ampm) {
							if (h == 0) tmph = 12 + 'a';
							else if (h < 12) tmph += 'a';
							else tmph += 'p';
						}
						html += '<td>' + tmph + '</td>';
					}

					html += '</tr></table></div>';
				}
				html += '</dd>';

				// Minutes
				html += '<dt class="ui_tpicker_minute_label" id="ui_tpicker_minute_label_' + dp_id + '"' +
					((o.showMinute) ? '' : noDisplay) + '>' + o.minuteText + '</dt>' +
					'<dd class="ui_tpicker_minute"><div id="ui_tpicker_minute_' + dp_id + '"' +
							((o.showMinute) ? '' : noDisplay) + '></div>';

				if (o.showMinute && o.minuteGrid > 0) {
					html += '<div style="padding-left: 1px"><table class="ui-tpicker-grid-label"><tr>';

					for (var m = o.minuteMin; m <= minMax; m += parseInt(o.minuteGrid, 10)) {
						minuteGridSize++;
						html += '<td>' + ((m < 10) ? '0' : '') + m + '</td>';
					}

					html += '</tr></table></div>';
				}
				html += '</dd>';

				// Seconds
				html += '<dt class="ui_tpicker_second_label" id="ui_tpicker_second_label_' + dp_id + '"' +
					((o.showSecond) ? '' : noDisplay) + '>' + o.secondText + '</dt>' +
					'<dd class="ui_tpicker_second"><div id="ui_tpicker_second_' + dp_id + '"' +
							((o.showSecond) ? '' : noDisplay) + '></div>';

				if (o.showSecond && o.secondGrid > 0) {
					html += '<div style="padding-left: 1px"><table><tr>';

					for (var s = o.secondMin; s <= secMax; s += parseInt(o.secondGrid, 10)) {
						secondGridSize++;
						html += '<td>' + ((s < 10) ? '0' : '') + s + '</td>';
					}

					html += '</tr></table></div>';
				}
				html += '</dd>';

				// Milliseconds
				html += '<dt class="ui_tpicker_millisec_label" id="ui_tpicker_millisec_label_' + dp_id + '"' +
					((o.showMillisec) ? '' : noDisplay) + '>' + o.millisecText + '</dt>' +
					'<dd class="ui_tpicker_millisec"><div id="ui_tpicker_millisec_' + dp_id + '"' +
							((o.showMillisec) ? '' : noDisplay) + '></div>';

				if (o.showMillisec && o.millisecGrid > 0) {
					html += '<div style="padding-left: 1px"><table><tr>';

					for (var l = o.millisecMin; l <= millisecMax; l += parseInt(o.millisecGrid, 10)) {
						millisecGridSize++;
						html += '<td>' + ((l < 10) ? '0' : '') + l + '</td>';
					}

					html += '</tr></table></div>';
				}
				html += '</dd>';

				// Timezone
				html += '<dt class="ui_tpicker_timezone_label" id="ui_tpicker_timezone_label_' + dp_id + '"' +
					((o.showTimezone) ? '' : noDisplay) + '>' + o.timezoneText + '</dt>';
				html += '<dd class="ui_tpicker_timezone" id="ui_tpicker_timezone_' + dp_id + '"' +
							((o.showTimezone) ? '' : noDisplay) + '></dd>';

				html += '</dl></div>';
				$tp = $(html);

				// if we only want time picker...
				if (o.timeOnly === true) {
					$tp.prepend(
					'<div class="ui-widget-header ui-helper-clearfix ui-corner-all">' +
						'<div class="ui-datepicker-title">' + o.timeOnlyTitle + '</div>' +
					'</div>');
					$dp.find('.ui-datepicker-header, .ui-datepicker-calendar').hide();
				}

				this.hour_slider = $tp.find('#ui_tpicker_hour_' + dp_id).slider({
					orientation: "horizontal",
					value: this.hour,
					min: o.hourMin,
					max: hourMax,
					step: o.stepHour,
					slide: function (event, ui) {
						tp_inst.hour_slider.slider("option", "value", ui.value);
						tp_inst._onTimeChange();
					}
				});


				// Updated by Peter Medeiros:
				// - Pass in Event and UI instance into slide function
				this.minute_slider = $tp.find('#ui_tpicker_minute_' + dp_id).slider({
					orientation: "horizontal",
					value: this.minute,
					min: o.minuteMin,
					max: minMax,
					step: o.stepMinute,
					slide: function (event, ui) {
						tp_inst.minute_slider.slider("option", "value", ui.value);
						tp_inst._onTimeChange();
					}
				});

				this.second_slider = $tp.find('#ui_tpicker_second_' + dp_id).slider({
					orientation: "horizontal",
					value: this.second,
					min: o.secondMin,
					max: secMax,
					step: o.stepSecond,
					slide: function (event, ui) {
						tp_inst.second_slider.slider("option", "value", ui.value);
						tp_inst._onTimeChange();
					}
				});

				this.millisec_slider = $tp.find('#ui_tpicker_millisec_' + dp_id).slider({
					orientation: "horizontal",
					value: this.millisec,
					min: o.millisecMin,
					max: millisecMax,
					step: o.stepMillisec,
					slide: function (event, ui) {
						tp_inst.millisec_slider.slider("option", "value", ui.value);
						tp_inst._onTimeChange();
					}
				});

				this.timezone_select = $tp.find('#ui_tpicker_timezone_' + dp_id).append('<select></select>').find("select");
				$.fn.append.apply(this.timezone_select,
				$.map(o.timezoneList, function (val, idx) {
					return $("<option />")
						.val(typeof val == "object" ? val.value : val)
						.text(typeof val == "object" ? val.label : val);
				})
			);
				this.timezone_select.val((typeof this.timezone != "undefined" && this.timezone != null && this.timezone != "") ? this.timezone : o.timezone);
				this.timezone_select.change(function () {
					tp_inst._onTimeChange();
				});

				// Add grid functionality
				if (o.showHour && o.hourGrid > 0) {
					size = 100 * hourGridSize * o.hourGrid / (hourMax - o.hourMin);

					$tp.find(".ui_tpicker_hour table").css({
						width: size + "%",
						marginLeft: (size / (-2 * hourGridSize)) + "%",
						borderCollapse: 'collapse'
					}).find("td").each(function (index) {
						$(this).click(function () {
							var h = $(this).html();
							if (o.ampm) {
								var ap = h.substring(2).toLowerCase(),
								aph = parseInt(h.substring(0, 2), 10);
								if (ap == 'a') {
									if (aph == 12) h = 0;
									else h = aph;
								} else if (aph == 12) h = 12;
								else h = aph + 12;
							}
							tp_inst.hour_slider.slider("option", "value", h);
							tp_inst._onTimeChange();
							tp_inst._onSelectHandler();
						}).css({
							cursor: 'pointer',
							width: (100 / hourGridSize) + '%',
							textAlign: 'center',
							overflow: 'hidden'
						});
					});
				}

				if (o.showMinute && o.minuteGrid > 0) {
					size = 100 * minuteGridSize * o.minuteGrid / (minMax - o.minuteMin);
					$tp.find(".ui_tpicker_minute table").css({
						width: size + "%",
						marginLeft: (size / (-2 * minuteGridSize)) + "%",
						borderCollapse: 'collapse'
					}).find("td").each(function (index) {
						$(this).click(function () {
							tp_inst.minute_slider.slider("option", "value", $(this).html());
							tp_inst._onTimeChange();
							tp_inst._onSelectHandler();
						}).css({
							cursor: 'pointer',
							width: (100 / minuteGridSize) + '%',
							textAlign: 'center',
							overflow: 'hidden'
						});
					});
				}

				if (o.showSecond && o.secondGrid > 0) {
					$tp.find(".ui_tpicker_second table").css({
						width: size + "%",
						marginLeft: (size / (-2 * secondGridSize)) + "%",
						borderCollapse: 'collapse'
					}).find("td").each(function (index) {
						$(this).click(function () {
							tp_inst.second_slider.slider("option", "value", $(this).html());
							tp_inst._onTimeChange();
							tp_inst._onSelectHandler();
						}).css({
							cursor: 'pointer',
							width: (100 / secondGridSize) + '%',
							textAlign: 'center',
							overflow: 'hidden'
						});
					});
				}

				if (o.showMillisec && o.millisecGrid > 0) {
					$tp.find(".ui_tpicker_millisec table").css({
						width: size + "%",
						marginLeft: (size / (-2 * millisecGridSize)) + "%",
						borderCollapse: 'collapse'
					}).find("td").each(function (index) {
						$(this).click(function () {
							tp_inst.millisec_slider.slider("option", "value", $(this).html());
							tp_inst._onTimeChange();
							tp_inst._onSelectHandler();
						}).css({
							cursor: 'pointer',
							width: (100 / millisecGridSize) + '%',
							textAlign: 'center',
							overflow: 'hidden'
						});
					});
				}

				var $buttonPanel = $dp.find('.ui-datepicker-buttonpane');
				if ($buttonPanel.length) $buttonPanel.before($tp);
				else $dp.append($tp);

				this.$timeObj = $tp.find('#ui_tpicker_time_' + dp_id);

				if (this.inst !== null) {
					var timeDefined = this.timeDefined;
					this._onTimeChange();
					this.timeDefined = timeDefined;
				}

				//Emulate datepicker onSelect behavior. Call on slidestop.
				var onSelectDelegate = function () {
					tp_inst._onSelectHandler();
				};
				this.hour_slider.bind('slidestop', onSelectDelegate);
				this.minute_slider.bind('slidestop', onSelectDelegate);
				this.second_slider.bind('slidestop', onSelectDelegate);
				this.millisec_slider.bind('slidestop', onSelectDelegate);

				// slideAccess integration: http://trentrichardson.com/2011/11/11/jquery-ui-sliders-and-touch-accessibility/
				if (this._defaults.addSliderAccess) {
					var sliderAccessArgs = this._defaults.sliderAccessArgs;
					setTimeout(function () { // fix for inline mode
						if ($tp.find('.ui-slider-access').length == 0) {
							$tp.find('.ui-slider:visible').sliderAccess(sliderAccessArgs);

							// fix any grids since sliders are shorter
							var sliderAccessWidth = $tp.find('.ui-slider-access:eq(0)').outerWidth(true);
							if (sliderAccessWidth) {
								$tp.find('table:visible').each(function () {
									var $g = $(this),
									oldWidth = $g.outerWidth(),
									oldMarginLeft = $g.css('marginLeft').toString().replace('%', ''),
									newWidth = oldWidth - sliderAccessWidth,
									newMarginLeft = ((oldMarginLeft * newWidth) / oldWidth) + '%';

									$g.css({ width: newWidth, marginLeft: newMarginLeft });
								});
							}
						}
					}, 0);
				}
				// end slideAccess integration

			}
		},

		//########################################################################
		// This function tries to limit the ability to go outside the
		// min/max date range
		//########################################################################
		_limitMinMaxDateTime: function (dp_inst, adjustSliders) {
			var o = this._defaults,
			dp_date = new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay);

			if (!this._defaults.showTimepicker) return; // No time so nothing to check here

			if ($.datepicker._get(dp_inst, 'minDateTime') !== null && $.datepicker._get(dp_inst, 'minDateTime') !== undefined && dp_date) {
				var minDateTime = $.datepicker._get(dp_inst, 'minDateTime'),
				minDateTimeDate = new Date(minDateTime.getFullYear(), minDateTime.getMonth(), minDateTime.getDate(), 0, 0, 0, 0);

				if (this.hourMinOriginal === null || this.minuteMinOriginal === null || this.secondMinOriginal === null || this.millisecMinOriginal === null) {
					this.hourMinOriginal = o.hourMin;
					this.minuteMinOriginal = o.minuteMin;
					this.secondMinOriginal = o.secondMin;
					this.millisecMinOriginal = o.millisecMin;
				}

				if (dp_inst.settings.timeOnly || minDateTimeDate.getTime() == dp_date.getTime()) {
					this._defaults.hourMin = minDateTime.getHours();
					if (this.hour <= this._defaults.hourMin) {
						this.hour = this._defaults.hourMin;
						this._defaults.minuteMin = minDateTime.getMinutes();
						if (this.minute <= this._defaults.minuteMin) {
							this.minute = this._defaults.minuteMin;
							this._defaults.secondMin = minDateTime.getSeconds();
						} else if (this.second <= this._defaults.secondMin) {
							this.second = this._defaults.secondMin;
							this._defaults.millisecMin = minDateTime.getMilliseconds();
						} else {
							if (this.millisec < this._defaults.millisecMin)
								this.millisec = this._defaults.millisecMin;
							this._defaults.millisecMin = this.millisecMinOriginal;
						}
					} else {
						this._defaults.minuteMin = this.minuteMinOriginal;
						this._defaults.secondMin = this.secondMinOriginal;
						this._defaults.millisecMin = this.millisecMinOriginal;
					}
				} else {
					this._defaults.hourMin = this.hourMinOriginal;
					this._defaults.minuteMin = this.minuteMinOriginal;
					this._defaults.secondMin = this.secondMinOriginal;
					this._defaults.millisecMin = this.millisecMinOriginal;
				}
			}

			if ($.datepicker._get(dp_inst, 'maxDateTime') !== null && $.datepicker._get(dp_inst, 'maxDateTime') !== undefined && dp_date) {
				var maxDateTime = $.datepicker._get(dp_inst, 'maxDateTime'),
				maxDateTimeDate = new Date(maxDateTime.getFullYear(), maxDateTime.getMonth(), maxDateTime.getDate(), 0, 0, 0, 0);

				if (this.hourMaxOriginal === null || this.minuteMaxOriginal === null || this.secondMaxOriginal === null) {
					this.hourMaxOriginal = o.hourMax;
					this.minuteMaxOriginal = o.minuteMax;
					this.secondMaxOriginal = o.secondMax;
					this.millisecMaxOriginal = o.millisecMax;
				}

				if (dp_inst.settings.timeOnly || maxDateTimeDate.getTime() == dp_date.getTime()) {
					this._defaults.hourMax = maxDateTime.getHours();
					if (this.hour >= this._defaults.hourMax) {
						this.hour = this._defaults.hourMax;
						this._defaults.minuteMax = maxDateTime.getMinutes();
						if (this.minute >= this._defaults.minuteMax) {
							this.minute = this._defaults.minuteMax;
							this._defaults.secondMax = maxDateTime.getSeconds();
						} else if (this.second >= this._defaults.secondMax) {
							this.second = this._defaults.secondMax;
							this._defaults.millisecMax = maxDateTime.getMilliseconds();
						} else {
							if (this.millisec > this._defaults.millisecMax) this.millisec = this._defaults.millisecMax;
							this._defaults.millisecMax = this.millisecMaxOriginal;
						}
					} else {
						this._defaults.minuteMax = this.minuteMaxOriginal;
						this._defaults.secondMax = this.secondMaxOriginal;
						this._defaults.millisecMax = this.millisecMaxOriginal;
					}
				} else {
					this._defaults.hourMax = this.hourMaxOriginal;
					this._defaults.minuteMax = this.minuteMaxOriginal;
					this._defaults.secondMax = this.secondMaxOriginal;
					this._defaults.millisecMax = this.millisecMaxOriginal;
				}
			}

			if (adjustSliders !== undefined && adjustSliders === true) {
				var hourMax = parseInt((this._defaults.hourMax - ((this._defaults.hourMax - this._defaults.hourMin) % this._defaults.stepHour)), 10),
                minMax = parseInt((this._defaults.minuteMax - ((this._defaults.minuteMax - this._defaults.minuteMin) % this._defaults.stepMinute)), 10),
                secMax = parseInt((this._defaults.secondMax - ((this._defaults.secondMax - this._defaults.secondMin) % this._defaults.stepSecond)), 10),
				millisecMax = parseInt((this._defaults.millisecMax - ((this._defaults.millisecMax - this._defaults.millisecMin) % this._defaults.stepMillisec)), 10);

				if (this.hour_slider)
					this.hour_slider.slider("option", { min: this._defaults.hourMin, max: hourMax }).slider('value', this.hour);
				if (this.minute_slider)
					this.minute_slider.slider("option", { min: this._defaults.minuteMin, max: minMax }).slider('value', this.minute);
				if (this.second_slider)
					this.second_slider.slider("option", { min: this._defaults.secondMin, max: secMax }).slider('value', this.second);
				if (this.millisec_slider)
					this.millisec_slider.slider("option", { min: this._defaults.millisecMin, max: millisecMax }).slider('value', this.millisec);
			}

		},


		//########################################################################
		// when a slider moves, set the internal time...
		// on time change is also called when the time is updated in the text field
		//########################################################################
		_onTimeChange: function () {
			var hour = (this.hour_slider) ? this.hour_slider.slider('value') : false,
			minute = (this.minute_slider) ? this.minute_slider.slider('value') : false,
			second = (this.second_slider) ? this.second_slider.slider('value') : false,
			millisec = (this.millisec_slider) ? this.millisec_slider.slider('value') : false,
			timezone = (this.timezone_select) ? this.timezone_select.val() : false,
			o = this._defaults;

			if (typeof (hour) == 'object') hour = false;
			if (typeof (minute) == 'object') minute = false;
			if (typeof (second) == 'object') second = false;
			if (typeof (millisec) == 'object') millisec = false;
			if (typeof (timezone) == 'object') timezone = false;

			if (hour !== false) hour = parseInt(hour, 10);
			if (minute !== false) minute = parseInt(minute, 10);
			if (second !== false) second = parseInt(second, 10);
			if (millisec !== false) millisec = parseInt(millisec, 10);

			var ampm = o[hour < 12 ? 'amNames' : 'pmNames'][0];

			// If the update was done in the input field, the input field should not be updated.
			// If the update was done using the sliders, update the input field.
			var hasChanged = (hour != this.hour || minute != this.minute
				|| second != this.second || millisec != this.millisec
				|| (this.ampm.length > 0
				    && (hour < 12) != ($.inArray(this.ampm.toUpperCase(), this.amNames) !== -1))
				|| timezone != this.timezone);

			if (hasChanged) {

				if (hour !== false) this.hour = hour;
				if (minute !== false) this.minute = minute;
				if (second !== false) this.second = second;
				if (millisec !== false) this.millisec = millisec;
				if (timezone !== false) this.timezone = timezone;

				if (!this.inst) this.inst = $.datepicker._getInst(this.$input[0]);

				this._limitMinMaxDateTime(this.inst, true);
			}
			if (o.ampm) this.ampm = ampm;

			//this._formatTime();
			this.formattedTime = $.datepicker.formatTime(this._defaults.timeFormat, this, this._defaults);
			if (this.$timeObj) this.$timeObj.text(this.formattedTime + o.timeSuffix);
			this.timeDefined = true;
			if (hasChanged) this._updateDateTime();
		},

		//########################################################################
		// call custom onSelect. 
		// bind to sliders slidestop, and grid click.
		//########################################################################
		_onSelectHandler: function () {
			var onSelect = this._defaults.onSelect;
			var inputEl = this.$input ? this.$input[0] : null;
			if (onSelect && inputEl) {
				onSelect.apply(inputEl, [this.formattedDateTime, this]);
			}
		},

		//########################################################################
		// left for any backwards compatibility
		//########################################################################
		_formatTime: function (time, format) {
			time = time || { hour: this.hour, minute: this.minute, second: this.second, millisec: this.millisec, ampm: this.ampm, timezone: this.timezone };
			var tmptime = (format || this._defaults.timeFormat).toString();

			tmptime = $.datepicker.formatTime(tmptime, time, this._defaults);

			if (arguments.length) return tmptime;
			else this.formattedTime = tmptime;
		},

		//########################################################################
		// update our input with the new date time..
		//########################################################################
		_updateDateTime: function (dp_inst) {
			dp_inst = this.inst || dp_inst;
			var dt = $.datepicker._daylightSavingAdjust(new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay)),
			dateFmt = $.datepicker._get(dp_inst, 'dateFormat'),
			formatCfg = $.datepicker._getFormatConfig(dp_inst),
			timeAvailable = dt !== null && this.timeDefined;
			this.formattedDate = $.datepicker.formatDate(dateFmt, (dt === null ? new Date() : dt), formatCfg);
			var formattedDateTime = this.formattedDate;
			if (dp_inst.lastVal !== undefined && (dp_inst.lastVal.length > 0 && this.$input.val().length === 0))
				return;

			if (this._defaults.timeOnly === true) {
				formattedDateTime = this.formattedTime;
			} else if (this._defaults.timeOnly !== true && (this._defaults.alwaysSetTime || timeAvailable)) {
				formattedDateTime += this._defaults.separator + this.formattedTime + this._defaults.timeSuffix;
			}

			this.formattedDateTime = formattedDateTime;

			if (!this._defaults.showTimepicker) {
				this.$input.val(this.formattedDate);
			} else if (this.$altInput && this._defaults.altFieldTimeOnly === true) {
				this.$altInput.val(this.formattedTime);
				this.$input.val(this.formattedDate);
			} else if (this.$altInput) {
				this.$altInput.val(formattedDateTime);
				this.$input.val(formattedDateTime);
			} else {
				this.$input.val(formattedDateTime);
			}

			this.$input.trigger("change");
		}

	});

	$.fn.extend({
		//########################################################################
		// shorthand just to use timepicker..
		//########################################################################
		timepicker: function (o) {
			o = o || {};
			var tmp_args = arguments;

			if (typeof o == 'object') tmp_args[0] = $.extend(o, { timeOnly: true });

			return $(this).each(function () {
				$.fn.datetimepicker.apply($(this), tmp_args);
			});
		},

		//########################################################################
		// extend timepicker to datepicker
		//########################################################################
		datetimepicker: function (o) {
			o = o || {};
			var $input = this,
		tmp_args = arguments;

			if (typeof (o) == 'string') {
				if (o == 'getDate')
					return $.fn.datepicker.apply($(this[0]), tmp_args);
				else
					return this.each(function () {
						var $t = $(this);
						$t.datepicker.apply($t, tmp_args);
					});
			}
			else
				return this.each(function () {
					var $t = $(this);
					$t.datepicker($.timepicker._newInst($t, o)._defaults);
				});
		}
	});

	//########################################################################
	// format the time all pretty... 
	// format = string format of the time
	// time = a {}, not a Date() for timezones
	// options = essentially the regional[].. amNames, pmNames, ampm
	//########################################################################
	$.datepicker.formatTime = function (format, time, options) {
		options = options || {};
		options = $.extend($.timepicker._defaults, options);
		time = $.extend({ hour: 0, minute: 0, second: 0, millisec: 0, timezone: '+0000' }, time);

		var tmptime = format;
		var ampmName = options['amNames'][0];

		var hour = parseInt(time.hour, 10);
		if (options.ampm) {
			if (hour > 11) {
				ampmName = options['pmNames'][0];
				if (hour > 12)
					hour = hour % 12;
			}
			if (hour === 0)
				hour = 12;
		}
		tmptime = tmptime.replace(/(?:hh?|mm?|ss?|[tT]{1,2}|[lz])/g, function (match) {
			switch (match.toLowerCase()) {
				case 'hh': return ('0' + hour).slice(-2);
				case 'h': return hour;
				case 'mm': return ('0' + time.minute).slice(-2);
				case 'm': return time.minute;
				case 'ss': return ('0' + time.second).slice(-2);
				case 's': return time.second;
				case 'l': return ('00' + time.millisec).slice(-3);
				case 'z': return time.timezone;
				case 't': case 'tt':
					if (options.ampm) {
						if (match.length == 1)
							ampmName = ampmName.charAt(0);
						return match.charAt(0) == 'T' ? ampmName.toUpperCase() : ampmName.toLowerCase();
					}
					return '';
			}
		});

		tmptime = $.trim(tmptime);
		return tmptime;
	}

	//########################################################################
	// the bad hack :/ override datepicker so it doesnt close on select
	// inspired: http://stackoverflow.com/questions/1252512/jquery-datepicker-prevent-closing-picker-when-clicking-a-date/1762378#1762378
	//########################################################################
	$.datepicker._base_selectDate = $.datepicker._selectDate;
	$.datepicker._selectDate = function (id, dateStr) {
		var inst = this._getInst($(id)[0]),
		tp_inst = this._get(inst, 'timepicker');

		if (tp_inst) {
			tp_inst._limitMinMaxDateTime(inst, true);
			inst.inline = inst.stay_open = true;
			//This way the onSelect handler called from calendarpicker get the full dateTime
			this._base_selectDate(id, dateStr);
			inst.inline = inst.stay_open = false;
			this._notifyChange(inst);
			this._updateDatepicker(inst);
		}
		else this._base_selectDate(id, dateStr);
	};

	//#############################################################################################
	// second bad hack :/ override datepicker so it triggers an event when changing the input field
	// and does not redraw the datepicker on every selectDate event
	//#############################################################################################
	$.datepicker._base_updateDatepicker = $.datepicker._updateDatepicker;
	$.datepicker._updateDatepicker = function (inst) {

		// don't popup the datepicker if there is another instance already opened
		var input = inst.input[0];
		if ($.datepicker._curInst &&
	   $.datepicker._curInst != inst &&
	   $.datepicker._datepickerShowing &&
	   $.datepicker._lastInput != input) {
			return;
		}

		if (typeof (inst.stay_open) !== 'boolean' || inst.stay_open === false) {

			this._base_updateDatepicker(inst);

			// Reload the time control when changing something in the input text field.
			var tp_inst = this._get(inst, 'timepicker');
			if (tp_inst) tp_inst._addTimePicker(inst);
		}
	};

	//#######################################################################################
	// third bad hack :/ override datepicker so it allows spaces and colon in the input field
	//#######################################################################################
	$.datepicker._base_doKeyPress = $.datepicker._doKeyPress;
	$.datepicker._doKeyPress = function (event) {
		var inst = $.datepicker._getInst(event.target),
		tp_inst = $.datepicker._get(inst, 'timepicker');

		if (tp_inst) {
			if ($.datepicker._get(inst, 'constrainInput')) {
				var ampm = tp_inst._defaults.ampm,
				dateChars = $.datepicker._possibleChars($.datepicker._get(inst, 'dateFormat')),
				datetimeChars = tp_inst._defaults.timeFormat.toString()
								.replace(/[hms]/g, '')
								.replace(/TT/g, ampm ? 'APM' : '')
								.replace(/Tt/g, ampm ? 'AaPpMm' : '')
								.replace(/tT/g, ampm ? 'AaPpMm' : '')
								.replace(/T/g, ampm ? 'AP' : '')
								.replace(/tt/g, ampm ? 'apm' : '')
								.replace(/t/g, ampm ? 'ap' : '') +
								" " +
								tp_inst._defaults.separator +
								tp_inst._defaults.timeSuffix +
								(tp_inst._defaults.showTimezone ? tp_inst._defaults.timezoneList.join('') : '') +
								(tp_inst._defaults.amNames.join('')) +
								(tp_inst._defaults.pmNames.join('')) +
								dateChars,
				chr = String.fromCharCode(event.charCode === undefined ? event.keyCode : event.charCode);
				return event.ctrlKey || (chr < ' ' || !dateChars || datetimeChars.indexOf(chr) > -1);
			}
		}

		return $.datepicker._base_doKeyPress(event);
	};

	//#######################################################################################
	// Override key up event to sync manual input changes.
	//#######################################################################################
	$.datepicker._base_doKeyUp = $.datepicker._doKeyUp;
	$.datepicker._doKeyUp = function (event) {
		var inst = $.datepicker._getInst(event.target),
		tp_inst = $.datepicker._get(inst, 'timepicker');

		if (tp_inst) {
			if (tp_inst._defaults.timeOnly && (inst.input.val() != inst.lastVal)) {
				try {
					$.datepicker._updateDatepicker(inst);
				}
				catch (err) {
					$.datepicker.log(err);
				}
			}
		}

		return $.datepicker._base_doKeyUp(event);
	};

	//#######################################################################################
	// override "Today" button to also grab the time.
	//#######################################################################################
	$.datepicker._base_gotoToday = $.datepicker._gotoToday;
	$.datepicker._gotoToday = function (id) {
		var inst = this._getInst($(id)[0]),
		$dp = inst.dpDiv;
		this._base_gotoToday(id);
		var now = new Date();
		var tp_inst = this._get(inst, 'timepicker');
		if (tp_inst && tp_inst._defaults.showTimezone && tp_inst.timezone_select) {
			var tzoffset = now.getTimezoneOffset(); // If +0100, returns -60
			var tzsign = tzoffset > 0 ? '-' : '+';
			tzoffset = Math.abs(tzoffset);
			var tzmin = tzoffset % 60;
			tzoffset = tzsign + ('0' + (tzoffset - tzmin) / 60).slice(-2) + ('0' + tzmin).slice(-2);
			if (tp_inst._defaults.timezoneIso8609)
				tzoffset = tzoffset.substring(0, 3) + ':' + tzoffset.substring(3);
			tp_inst.timezone_select.val(tzoffset);
		}
		this._setTime(inst, now);
		$('.ui-datepicker-today', $dp).click();
	};

	//#######################################################################################
	// Disable & enable the Time in the datetimepicker
	//#######################################################################################
	$.datepicker._disableTimepickerDatepicker = function (target, date, withDate) {
		var inst = this._getInst(target),
	tp_inst = this._get(inst, 'timepicker');
		$(target).datepicker('getDate'); // Init selected[Year|Month|Day]
		if (tp_inst) {
			tp_inst._defaults.showTimepicker = false;
			tp_inst._updateDateTime(inst);
		}
	};

	$.datepicker._enableTimepickerDatepicker = function (target, date, withDate) {
		var inst = this._getInst(target),
	tp_inst = this._get(inst, 'timepicker');
		$(target).datepicker('getDate'); // Init selected[Year|Month|Day]
		if (tp_inst) {
			tp_inst._defaults.showTimepicker = true;
			tp_inst._addTimePicker(inst); // Could be disabled on page load
			tp_inst._updateDateTime(inst);
		}
	};

	//#######################################################################################
	// Create our own set time function
	//#######################################################################################
	$.datepicker._setTime = function (inst, date) {
		var tp_inst = this._get(inst, 'timepicker');
		if (tp_inst) {
			var defaults = tp_inst._defaults,
			// calling _setTime with no date sets time to defaults
			hour = date ? date.getHours() : defaults.hour,
			minute = date ? date.getMinutes() : defaults.minute,
			second = date ? date.getSeconds() : defaults.second,
			millisec = date ? date.getMilliseconds() : defaults.millisec;

			//check if within min/max times..
			if ((hour < defaults.hourMin || hour > defaults.hourMax) || (minute < defaults.minuteMin || minute > defaults.minuteMax) || (second < defaults.secondMin || second > defaults.secondMax) || (millisec < defaults.millisecMin || millisec > defaults.millisecMax)) {
				hour = defaults.hourMin;
				minute = defaults.minuteMin;
				second = defaults.secondMin;
				millisec = defaults.millisecMin;
			}

			tp_inst.hour = hour;
			tp_inst.minute = minute;
			tp_inst.second = second;
			tp_inst.millisec = millisec;

			if (tp_inst.hour_slider) tp_inst.hour_slider.slider('value', hour);
			if (tp_inst.minute_slider) tp_inst.minute_slider.slider('value', minute);
			if (tp_inst.second_slider) tp_inst.second_slider.slider('value', second);
			if (tp_inst.millisec_slider) tp_inst.millisec_slider.slider('value', millisec);

			tp_inst._onTimeChange();
			tp_inst._updateDateTime(inst);
		}
	};

	//#######################################################################################
	// Create new public method to set only time, callable as $().datepicker('setTime', date)
	//#######################################################################################
	$.datepicker._setTimeDatepicker = function (target, date, withDate) {
		var inst = this._getInst(target),
		tp_inst = this._get(inst, 'timepicker');

		if (tp_inst) {
			this._setDateFromField(inst);
			var tp_date;
			if (date) {
				if (typeof date == "string") {
					tp_inst._parseTime(date, withDate);
					tp_date = new Date();
					tp_date.setHours(tp_inst.hour, tp_inst.minute, tp_inst.second, tp_inst.millisec);
				}
				else tp_date = new Date(date.getTime());
				if (tp_date.toString() == 'Invalid Date') tp_date = undefined;
				this._setTime(inst, tp_date);
			}
		}

	};

	//#######################################################################################
	// override setDate() to allow setting time too within Date object
	//#######################################################################################
	$.datepicker._base_setDateDatepicker = $.datepicker._setDateDatepicker;
	$.datepicker._setDateDatepicker = function (target, date) {
		var inst = this._getInst(target),
	tp_date = (date instanceof Date) ? new Date(date.getTime()) : date;

		this._updateDatepicker(inst);
		this._base_setDateDatepicker.apply(this, arguments);
		this._setTimeDatepicker(target, tp_date, true);
	};

	//#######################################################################################
	// override getDate() to allow getting time too within Date object
	//#######################################################################################
	$.datepicker._base_getDateDatepicker = $.datepicker._getDateDatepicker;
	$.datepicker._getDateDatepicker = function (target, noDefault) {
		var inst = this._getInst(target),
		tp_inst = this._get(inst, 'timepicker');

		if (tp_inst) {
			this._setDateFromField(inst, noDefault);
			var date = this._getDate(inst);
			if (date && tp_inst._parseTime($(target).val(), tp_inst.timeOnly)) date.setHours(tp_inst.hour, tp_inst.minute, tp_inst.second, tp_inst.millisec);
			return date;
		}
		return this._base_getDateDatepicker(target, noDefault);
	};

	//#######################################################################################
	// override parseDate() because UI 1.8.14 throws an error about "Extra characters"
	// An option in datapicker to ignore extra format characters would be nicer.
	//#######################################################################################
	$.datepicker._base_parseDate = $.datepicker.parseDate;
	$.datepicker.parseDate = function (format, value, settings) {
		var date;
		try {
			date = this._base_parseDate(format, value, settings);
		} catch (err) {
			if (err.indexOf(":") >= 0) {
				// Hack!  The error message ends with a colon, a space, and
				// the "extra" characters.  We rely on that instead of
				// attempting to perfectly reproduce the parsing algorithm.
				date = this._base_parseDate(format, value.substring(0, value.length - (err.length - err.indexOf(':') - 2)), settings);
			} else {
				// The underlying error was not related to the time
				throw err;
			}
		}
		return date;
	};

	//#######################################################################################
	// override formatDate to set date with time to the input
	//#######################################################################################
	$.datepicker._base_formatDate = $.datepicker._formatDate;
	$.datepicker._formatDate = function (inst, day, month, year) {
		var tp_inst = this._get(inst, 'timepicker');
		if (tp_inst) {
			if (day)
				var b = this._base_formatDate(inst, day, month, year);
			tp_inst._updateDateTime(inst);
			return tp_inst.$input.val();
		}
		return this._base_formatDate(inst);
	};

	//#######################################################################################
	// override options setter to add time to maxDate(Time) and minDate(Time). MaxDate
	//#######################################################################################
	$.datepicker._base_optionDatepicker = $.datepicker._optionDatepicker;
	$.datepicker._optionDatepicker = function (target, name, value) {
		var inst = this._getInst(target),
		tp_inst = this._get(inst, 'timepicker');
		if (tp_inst) {
			var min, max, onselect;
			if (typeof name == 'string') { // if min/max was set with the string
				if (name === 'minDate' || name === 'minDateTime')
					min = value;
				else if (name === 'maxDate' || name === 'maxDateTime')
					max = value;
				else if (name === 'onSelect')
					onselect = value;
			} else if (typeof name == 'object') { //if min/max was set with the JSON
				if (name.minDate)
					min = name.minDate;
				else if (name.minDateTime)
					min = name.minDateTime;
				else if (name.maxDate)
					max = name.maxDate;
				else if (name.maxDateTime)
					max = name.maxDateTime;
			}
			if (min) { //if min was set
				if (min == 0)
					min = new Date();
				else
					min = new Date(min);

				tp_inst._defaults.minDate = min;
				tp_inst._defaults.minDateTime = min;
			} else if (max) { //if max was set
				if (max == 0)
					max = new Date();
				else
					max = new Date(max);
				tp_inst._defaults.maxDate = max;
				tp_inst._defaults.maxDateTime = max;
			}
			else if (onselect)
				tp_inst._defaults.onSelect = onselect;
		}
		if (value === undefined)
			return this._base_optionDatepicker(target, name);
		return this._base_optionDatepicker(target, name, value);
	};

	//#######################################################################################
	// jQuery extend now ignores nulls!
	//#######################################################################################
	function extendRemove(target, props) {
		$.extend(target, props);
		for (var name in props)
			if (props[name] === null || props[name] === undefined)
				target[name] = props[name];
		return target;
	};

	$.timepicker = new Timepicker(); // singleton instance
	$.timepicker.version = "0.9.9";

})(jQuery);


/*! http://mths.be/placeholder v2.1.2 by @mathias 
 * 
 *  jquery.placeholder.js
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	// Opera Mini v7 doesn't support placeholder although its DOM seems to indicate so
	var isOperaMini = Object.prototype.toString.call(window.operamini) === '[object OperaMini]';
	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
	var valHooks = $.valHooks;
	var propHooks = $.propHooks;
	var hooks;
	var placeholder;
	var settings = {};

	if (isInputSupported && isTextareaSupported) {

		placeholder = $.fn.placeholder = function () {
			return this;
		};

		placeholder.input = true;
		placeholder.textarea = true;

	} else {

		placeholder = $.fn.placeholder = function (options) {

			var defaults = { customClass: 'placeholder' };
			settings = $.extend({}, defaults, options);

			return this.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
                .not('.' + settings.customClass)
                .bind({
                	'focus.placeholder': clearPlaceholder,
                	'blur.placeholder': setPlaceholder
                })
                .data('placeholder-enabled', true)
                .trigger('blur.placeholder');
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		hooks = {
			'get': function (element) {

				var $element = $(element);
				var $passwordInput = $element.data('placeholder-password');

				if ($passwordInput) {
					return $passwordInput[0].value;
				}

				return $element.data('placeholder-enabled') && $element.hasClass(settings.customClass) ? '' : element.value;
			},
			'set': function (element, value) {

				var $element = $(element);
				var $replacement;
				var $passwordInput;

				if (value !== '') {

					$replacement = $element.data('placeholder-textinput');
					$passwordInput = $element.data('placeholder-password');

					if ($replacement) {
						clearPlaceholder.call($replacement[0], true, value) || (element.value = value);
						$replacement[0].value = value;

					} else if ($passwordInput) {
						clearPlaceholder.call(element, true, value) || ($passwordInput[0].value = value);
						element.value = value;
					}
				}

				if (!$element.data('placeholder-enabled')) {
					element.value = value;
					return $element;
				}

				if (value === '') {

					element.value = value;

					// Setting the placeholder causes problems if the element continues to have focus.
					if (element != safeActiveElement()) {
						// We can't use `triggerHandler` here because of dummy text/password inputs :(
						setPlaceholder.call(element);
					}

				} else {

					if ($element.hasClass(settings.customClass)) {
						clearPlaceholder.call(element);
					}

					element.value = value;
				}
				// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
				return $element;
			}
		};

		if (!isInputSupported) {
			valHooks.input = hooks;
			propHooks.value = hooks;
		}

		if (!isTextareaSupported) {
			valHooks.textarea = hooks;
			propHooks.value = hooks;
		}

		$(function () {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function () {

				// Clear the placeholder values so they don't get submitted
				var $inputs = $('.' + settings.customClass, this).each(function () {
					clearPlaceholder.call(this, true, '');
				});

				setTimeout(function () {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('beforeunload.placeholder', function () {
			$('.' + settings.customClass).each(function () {
				this.value = '';
			});
		});
	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {};
		var rinlinejQuery = /^jQuery\d+$/;

		$.each(elem.attributes, function (i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});

		return newAttrs;
	}

	function clearPlaceholder(event, value) {

		var input = this;
		var $input = $(input);

		if (input.value === $input.attr('placeholder') && $input.hasClass(settings.customClass)) {

			input.value = '';
			$input.removeClass(settings.customClass);

			if ($input.data('placeholder-password')) {

				$input = $input.hide().nextAll('input[type="password"]:first').show().attr('id', $input.removeAttr('id').data('placeholder-id'));

				// If `clearPlaceholder` was called from `$.valHooks.input.set`
				if (event === true) {
					$input[0].value = value;

					return value;
				}

				$input.focus();

			} else {
				input == safeActiveElement() && input.select();
			}
		}
	}

	function setPlaceholder(event) {
		var $replacement;
		var input = this;
		var $input = $(input);
		var id = input.id;

		// If the placeholder is activated, triggering blur event (`$input.trigger('blur')`) should do nothing.
		if (event && event.type === 'blur') {

			if ($input.hasClass(settings.customClass)) {
				return;
			}

			if (input.type === 'password') {
				$replacement = $input.prevAll('input[type="text"]:first');
				if ($replacement.length > 0 && $replacement.is(':visible')) {
					return;
				}
			}
		}

		if (input.value === '') {
			if (input.type === 'password') {
				if (!$input.data('placeholder-textinput')) {

					try {
						$replacement = $input.clone().prop({ 'type': 'text' });
					} catch (e) {
						$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					}

					$replacement
                        .removeAttr('name')
                        .data({
                        	'placeholder-enabled': true,
                        	'placeholder-password': $input,
                        	'placeholder-id': id
                        })
                        .bind('focus.placeholder', clearPlaceholder);

					$input
                        .data({
                        	'placeholder-textinput': $replacement,
                        	'placeholder-id': id
                        })
                        .before($replacement);
				}

				input.value = '';
				$input = $input.removeAttr('id').hide().prevAll('input[type="text"]:first').attr('id', $input.data('placeholder-id')).show();

			} else {

				var $passwordInput = $input.data('placeholder-password');

				if ($passwordInput) {
					$passwordInput[0].value = '';
					$input.attr('id', $input.data('placeholder-id')).show().nextAll('input[type="password"]:last').hide().removeAttr('id');
				}
			}

			$input.addClass(settings.customClass);
			$input[0].value = $input.attr('placeholder');

		} else {
			$input.removeClass(settings.customClass);
		}
	}

	function safeActiveElement() {
		// Avoid IE9 `document.activeElement` of death
		try {
			return document.activeElement;
		} catch (exception) { }
	}
}));