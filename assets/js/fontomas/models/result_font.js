/*global fontomas, _, Backbone*/

;(function () {
  "use strict";


  var config = fontomas.config;


  fontomas.models.result_font = Backbone.Model.extend({
    defaults: {
      glyph_count:  0,
      xml_template: null
    },


    initialize: function () {
      this.set("xml_template", this.initSvgFontTemplate());
      this.glyphs = new fontomas.models.glyphs_collection;

      this.glyphs.on("add",     this.incCounter, this);
      this.glyphs.on("remove",  this.decCounter, this);
    },


    initSvgFontTemplate: function () {
      var xml_string, xml_template;

      try {
        xml_string    = $('#fm-font-output').html().trimLeft();
        xml_template  = $.parseXML(xml_string);
      } catch (e) {
        fontomas.logger.error(
          "initSvgFontTemplate: invalid xml template=",
          $('#fm-font-output').html(),
          "e=", e
        );
        fontomas.util.notify_alert("Internal error: can't parse output template.");
        return null;
      }

      $(xml_template)
        .find("metadata").text(config.output.metadata)
        .end()
        .find("font").attr({
          "id":           config.output.font_id,
          "horiz-adv-x":  config.output.horiz_adv_x
        })
        .end()
        .find("font-face").attr({
          "units-per-em": config.output.units_per_em,
          "ascent":       config.output.ascent,
          "descent":      config.output.descent
        })
        .end()
        .find("missing-glyph").attr({
          "horiz-adv-x":  config.output.missing_glyph_horiz_adv_x
        });

        return xml_template;
    },


    incCounter: function () {
      this.set("glyph_count", this.get("glyph_count") + 1);
    },


    decCounter: function () {
      this.set("glyph_count", this.get("glyph_count") - 1);
      fontomas.logger.assert(this.get("glyph_count") >= 0);
    },


    // Stub to prevent Backbone from reading or saving the model to the server.
    // Backbone calls `Backbone.sync()` function (on fetch/save/destroy)
    // if model doesn't have own `sync()` method.
    sync: function () {}
  });

}());
