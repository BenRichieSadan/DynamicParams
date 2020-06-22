/**
 * Dynamic Params logical file
 * Developed By: Ben Richie Sadan @ Sisense
 * Version : 1.0
 * Last Modified Date : 22-June-2020
 */

let widgetName = 'DynamicParams';

prism.registerWidget(widgetName, {
  name: widgetName,
  family: widgetName,
  title: widgetName,
  iconSmall: "/plugins/" + widgetName + "/" + widgetName + "-icon-small.png",
  styleEditorTemplate: "/plugins/" + widgetName + "/styler.html",
  hideNoResults: true,
  directive: {
    desktop: widgetName
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

      widget.numOfValues = 0;
      widget.fieldsForDynamicParams = {};

      if (widget.metadata.panel("Fields").items.length > 0) {
        widget.metadata.panel("Fields").items.forEach(valueItem => {
          query.metadata.push(valueItem);
          
          widget.fieldsForDynamicParams[valueItem.jaql.dim] = {
            title: valueItem.jaql.title,
            value: 1
          };

          widget.numOfValues++;
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

    registerWidgetsToBeforeQueryListener();

    prism.activeDashboard.dynamicParamsInputs = {};

    if (widget.numOfValues > 0) {
      for (let key in widget.fieldsForDynamicParams) {
        if (widget.fieldsForDynamicParams.hasOwnProperty(key)) {
          let curParamVal = widget.fieldsForDynamicParams[key];

          let paramNameElm = document.createElement('h4');
          paramNameElm.innerHTML = curParamVal.title;

          let paramInputElm = document.createElement('input');
          paramInputElm.id = key + 'DynamicParamInput';
          paramInputElm.type = 'text';
          paramInputElm.value = curParamVal.value;

          prism.activeDashboard.dynamicParamsInputs[key] = paramInputElm;

          element.append(paramNameElm);
          element.append(paramInputElm);
        }
      }

      let applyBtnElm = document.createElement('button');
      applyBtnElm.addEventListener('click', applyDynamicParams);
      applyBtnElm.className = 'btn';
      applyBtnElm.style.padding = '2px';
      applyBtnElm.innerText = "Apply";

      let resetBtnElm = document.createElement('button');
      resetBtnElm.addEventListener('click', resetDynamicParams);
      resetBtnElm.className = 'btn';
      resetBtnElm.style.padding = '2px';
      resetBtnElm.innerText = "Reset";
      resetBtnElm.style.marginLeft = '104px';

      element[0].style.overflow = 'auto';

      let brline = document.createElement('br');

      element.append(brline);

      element.append(applyBtnElm);
      element.append(resetBtnElm);
    }
  },
  options: {}
});

function registerWidgetsToBeforeQueryListener() {
  for (let index = 0; index < prism.activeDashboard.widgets.length; index++) {
    let curWidToListen = prism.activeDashboard.widgets.$$widgets[index];

    if (curWidToListen.$$events.beforequery.handlers.length == 0 || curWidToListen.$$events.beforequery.handlers.includes(handleWidgetBeforeQuerty) == false) {
      curWidToListen.on("beforequery", handleWidgetBeforeQuerty);
    }
  }
}

function handleWidgetBeforeQuerty(widget, query) {
  if (prism.activeDashboard.overrideValsConfig == null) {

  } else {
    for (let index = 0; index < query.query.metadata.length; index++) {
      let curJaql = query.query.metadata[index].jaql;
      if (curJaql.context != null) {
        for (let key in curJaql.context) {
          if (curJaql.context.hasOwnProperty(key)) {
            let currContext = curJaql.context[key];

            if (prism.activeDashboard.overrideValsConfig.hasOwnProperty(currContext.dim)) {
              curJaql.formula = curJaql.formula.replace(
                key,
                prism.activeDashboard.overrideValsConfig[currContext.dim]
              );
            }
          }
        }
      }
    }
  }
}

function applyDynamicParams(event) {
  prism.activeDashboard.overrideValsConfig = {};

  for (let key in prism.activeDashboard.dynamicParamsInputs) {
    if (prism.activeDashboard.dynamicParamsInputs.hasOwnProperty(key)) {
      let curParamVal = prism.activeDashboard.dynamicParamsInputs[key];

      prism.activeDashboard.overrideValsConfig[key] = curParamVal.value;
    }
  }

  for (let index = 0; index < prism.activeDashboard.widgets.length; index++) {
    let curWidToListen = prism.activeDashboard.widgets.$$widgets[index];

    if (curWidToListen.type != widgetName) {
      curWidToListen.refresh();
    }
  }
}

function resetDynamicParams(event) {
  prism.activeDashboard.overrideValsConfig = null;

  for (let index = 0; index < prism.activeDashboard.widgets.length; index++) {
    let curWidToListen = prism.activeDashboard.widgets.$$widgets[index];

    if (curWidToListen.type != widgetName) {
      curWidToListen.refresh();
    }
  }
}