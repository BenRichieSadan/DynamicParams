/**
 * Dynamic Params main file
 * Developed By: Ben Richie Sadan @ Sisense
 * Version : 1.2.0
 * Last Modified Date : 23-July-2020
 */

prism.registerWidget('DynamicParams', {
  name: 'DynamicParams',
  family: 'DynamicParams',
  title: 'DynamicParams',
  iconSmall: "/plugins/" + 'DynamicParams' + "/" + 'DynamicParams' + "-icon-small.png",
  styleEditorTemplate: "/plugins/" + 'DynamicParams' + "/styler.html",
  hideNoResults: true,
  directive: {
    desktop: 'DynamicParams'
  },
  style: {
    isRoundStrokes: true
  },
  data: {
    selection: [],
    defaultQueryResult: {},
    panels: [{
        name: 'Fields',
        type: "visible",
        metadata: {
          types: ['measures'],
          maxitems: -1
        },
        visibility: true
      },
      {
        name: 'filters',
        type: 'filters',
        metadata: {
          types: ['dimensions'],
          maxitems: -1
        }
      }
    ],
    // builds a jaql query from the given widget
    buildQuery: function (widget) {
      // building jaql query object from widget metadata 
      var query = {
        datasource: widget.datasource,
        format: "json",
        isMaskedResult: true,
        metadata: []
      };

      if (widget.metadata.panel("Fields").items.length > 0) {
        widget.metadata.panel("Fields").items.forEach(valueItem => {
          query.metadata.push(valueItem);
        });
      };

      // pushing filters
      if (defined(widget.metadata.panel("filters"), 'items.0')) {
        widget.metadata.panel('filters').items.forEach(function (item) {
          item = $$.object.clone(item, true);
          item.panel = "scope";
          query.metadata.push(item);
        });
      }
      return query;
    },

    processResult: function (widget, queryResult) {}
  },
  render: function (widget, event) {
    // 	Get widget element, and clear it out
    var element = $(event.element);
    element.empty();

    initializeDynamicParams(widget, element);
  }
});