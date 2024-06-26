(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          let theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: "galleryLightbox",
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  
  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () => 
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () => 
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("show");
    },

    prevImage(lightboxId) {
      let activeImage = $(".lightboxImage").attr("src");
      let imagesCollection = [];
      $(".gallery-item").each(function() {
        if ($(this).is(":visible")) {
          imagesCollection.push($(this));
        }
      });
      let currentIndex = imagesCollection.findIndex(img => img.attr("src") === activeImage);
      let prevIndex = (currentIndex - 1 + imagesCollection.length) % imagesCollection.length;
      $(".lightboxImage").attr("src", imagesCollection[prevIndex].attr("src"));
      $(`#${lightboxId}`).modal("show");
    },

    nextImage(lightboxId) {
      let activeImage = $(".lightboxImage").attr("src");
      let imagesCollection = [];
      $(".gallery-item").each(function() {
        if ($(this).is(":visible")) {
          imagesCollection.push($(this));
        }
      });
      let currentIndex = imagesCollection.findIndex(img => img.attr("src") === activeImage);
      let nextIndex = (currentIndex + 1) % imagesCollection.length;
      $(".lightboxImage").attr("src", imagesCollection[nextIndex].attr("src"));
      $(`#${lightboxId}`).modal("show");
    },

    createLightBox(gallery, lightboxId, navigation) {
      if ($(`#${lightboxId}`).length === 0) {
        gallery.append(`<div class="modal fade" id="${
          lightboxId ? lightboxId : "galleryLightbox"
        }" tabindex="-1" role="dialog" aria-hidden="true">
                  <div class="modal-dialog" role="document">
                      <div class="modal-content">
                          <div class="modal-body">
                              ${
                                navigation
                                  ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                  : '<span style="display:none;" />'
                              }
                              <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
                              ${
                                navigation
                                  ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                  : '<span style="display:none;" />'
                              }
                          </div>
                      </div>
                  </div>
              </div>`);
      }
    },

    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag bg-gold" data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item">
                <span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      /*fixing changing color buttons*/
      
      $(".tags-bar .nav-link").removeClass("active");
      $(this).addClass("active");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this).parents(".item-column").hide();
        if (tag === "all") {
          $(this).parents(".item-column").show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this).parents(".item-column").show(300);
        }
      });
    }
  };
})(jQuery);

/* minified document */

! function(a) {
	a.fn.mauGallery = function(e) {
		e = a.extend(a.fn.mauGallery.defaults, e);
		var t = [];
		return this.each((function() {
			a.fn.mauGallery.methods.createRowWrapper(a(this)), e.lightBox && a.fn.mauGallery.methods.createLightBox(a(this), e.lightboxId, e.navigation), a.fn.mauGallery.listeners(e), a(this).children(".gallery-item").each((function(l) {
				a.fn.mauGallery.methods.responsiveImageItem(a(this)), a.fn.mauGallery.methods.moveItemInRowWrapper(a(this)), a.fn.mauGallery.methods.wrapItemInColumn(a(this), e.columns);
				let s = a(this).data("gallery-tag");
				e.showTags && void 0 !== s && -1 === t.indexOf(s) && t.push(s)
			})), e.showTags && a.fn.mauGallery.methods.showItemTags(a(this), e.tagsPosition, t), a(this).fadeIn(500)
		}))
	}, a.fn.mauGallery.defaults = {
		columns: 3,
		lightBox: !0,
		lightboxId: "galleryLightbox",
		showTags: !0,
		tagsPosition: "bottom",
		navigation: !0
	}, a.fn.mauGallery.listeners = function(e) {
		a(".gallery-item").on("click", (function() {
			e.lightBox && "IMG" === a(this).prop("tagName") && a.fn.mauGallery.methods.openLightBox(a(this), e.lightboxId)
		})), a(".gallery").on("click", ".nav-link", a.fn.mauGallery.methods.filterByTag), a(".gallery").on("click", ".mg-prev", (() => a.fn.mauGallery.methods.prevImage(e.lightboxId))), a(".gallery").on("click", ".mg-next", (() => a.fn.mauGallery.methods.nextImage(e.lightboxId)))
	}, a.fn.mauGallery.methods = {
		createRowWrapper(a) {
			a.children().first().hasClass("row") || a.append('<div class="gallery-items-row row"></div>')
		},
		wrapItemInColumn(a, e) {
			if (e.constructor === Number) a.wrap(`<div class='item-column mb-4 col-${Math.ceil(12/e)}'></div>`);
			else if (e.constructor === Object) {
				var t = "";
				e.xs && (t += ` col-${Math.ceil(12/e.xs)}`), e.sm && (t += ` col-sm-${Math.ceil(12/e.sm)}`), e.md && (t += ` col-md-${Math.ceil(12/e.md)}`), e.lg && (t += ` col-lg-${Math.ceil(12/e.lg)}`), e.xl && (t += ` col-xl-${Math.ceil(12/e.xl)}`), a.wrap(`<div class='item-column mb-4${t}'></div>`)
			} else console.error(`Columns should be defined as numbers or objects. ${typeof e} is not supported.`)
		},
		moveItemInRowWrapper(a) {
			a.appendTo(".gallery-items-row")
		},
		responsiveImageItem(a) {
			"IMG" === a.prop("tagName") && a.addClass("img-fluid")
		},
		openLightBox(e, t) {
			a(`#${t}`).find(".lightboxImage").attr("src", e.attr("src")), a(`#${t}`).modal("show")
		},
		prevImage(e) {
			let t = a(".lightboxImage").attr("src"),
				l = [];
			a(".gallery-item").each((function() {
				a(this).is(":visible") && l.push(a(this))
			}));
			let s = (l.findIndex((a => a.attr("src") === t)) - 1 + l.length) % l.length;
			a(".lightboxImage").attr("src", l[s].attr("src")), a(`#${e}`).modal("show")
		},
		nextImage(e) {
			let t = a(".lightboxImage").attr("src"),
				l = [];
			a(".gallery-item").each((function() {
				a(this).is(":visible") && l.push(a(this))
			}));
			let s = (l.findIndex((a => a.attr("src") === t)) + 1) % l.length;
			a(".lightboxImage").attr("src", l[s].attr("src")), a(`#${e}`).modal("show")
		},
		createLightBox(e, t, l) {
			0 === a(`#${t}`).length && e.append(`<div class="modal fade" id="${t||"galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">\n                  <div class="modal-dialog" role="document">\n                      <div class="modal-content">\n                          <div class="modal-body">\n                              ${l?'<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>':'<span style="display:none;" />'}\n                              <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>\n                              ${l?'<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>':'<span style="display:none;" />'}\n                          </div>\n                      </div>\n                  </div>\n              </div>`)
		},
		showItemTags(e, t, l) {
			var s = '<li class="nav-item"><span class="nav-link active active-tag bg-gold" data-images-toggle="all">Tous</span></li>';
			a.each(l, (function(a, e) {
				s += `<li class="nav-item">\n                <span class="nav-link" data-images-toggle="${e}">${e}</span></li>`
			}));
			var i = `<ul class="my-4 tags-bar nav nav-pills">${s}</ul>`;
			"bottom" === t ? e.append(i) : "top" === t ? e.prepend(i) : console.error(`Unknown tags position: ${t}`)
		},
		filterByTag() {
			a(".tags-bar .nav-link").removeClass("active"), a(this).addClass("active");
			var e = a(this).data("images-toggle");
			a(".gallery-item").each((function() {
				a(this).parents(".item-column").hide(), ("all" === e || a(this).data("gallery-tag") === e) && a(this).parents(".item-column").show(300)
			}))
		}
	}
}(jQuery);