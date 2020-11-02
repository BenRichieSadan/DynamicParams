/**
 * Dynamic Params logical file
 * Developed By: Ben Richie Sadan @ Sisense
 * Version : 2.0.0
 * Last Modified Date : 2-Nov-2020
 */
var dynamicParamsData;

function initializeDynamicParams(widget, element) {
  dynamicParamsData = {
    fieldsForDynamicParams: [],
    FormulasForDynamicParams: [],
    dynamicParamsInputs: [],
    numOfValues: 0,
    numOfFormulas: 0
  };
  if (widget.metadata.panel("Fields").items.length > 0) {
    widget.metadata.panel("Fields").items.forEach(valueItem => {
      if (valueItem.jaql.context) {
        dynamicParamsData.FormulasForDynamicParams[valueItem.jaql.formula] = {
          title: valueItem.jaql.title,
          formula: valueItem.jaql.formula,
          value: 1
        };
        dynamicParamsData.numOfFormulas++;
      } else {
        dynamicParamsData.fieldsForDynamicParams[valueItem.jaql.dim] = {
          title: valueItem.jaql.title,
          value: 1
        };
        dynamicParamsData.numOfValues++;
      }
    });
  };
  registerWidgetsToBeforeQueryListener();
  if (dynamicParamsData.numOfValues > 0) {
    for (var key in dynamicParamsData.fieldsForDynamicParams) {
      if (dynamicParamsData.fieldsForDynamicParams.hasOwnProperty(key)) {
        var curParamVal = dynamicParamsData.fieldsForDynamicParams[key];
        var paramNameElm = document.createElement('h4');
        paramNameElm.innerHTML = curParamVal.title;
        var paramInputElm = document.createElement('input');
        paramInputElm.id = key + 'DynamicParamInput';
        paramInputElm.type = 'text';
        paramInputElm.value = curParamVal.value;
        dynamicParamsData.dynamicParamsInputs[key] = paramInputElm;
        element.append(paramNameElm);
        element.append(paramInputElm);
      }
    }
  }
  if (dynamicParamsData.numOfFormulas > 0) {
    for (var key in dynamicParamsData.FormulasForDynamicParams) {
      if (dynamicParamsData.FormulasForDynamicParams.hasOwnProperty(key)) {
        var curParamVal = dynamicParamsData.FormulasForDynamicParams[key];
        var paramNameElm = document.createElement('h4');
        paramNameElm.innerHTML = curParamVal.title;
        var paramInputElm = document.createElement('input');
        paramInputElm.id = key + 'DynamicParamInput';
        paramInputElm.type = 'text';
        paramInputElm.value = curParamVal.value;
        dynamicParamsData.dynamicParamsInputs[key] = paramInputElm;
        element.append(paramNameElm);
        element.append(paramInputElm);
      }
    }
  }
  if (dynamicParamsData.numOfFormulas > 0 || dynamicParamsData.numOfValues > 0) {
    var applyBtnElm = document.createElement('button');
    applyBtnElm.addEventListener('click', applyDynamicParams);
    applyBtnElm.className = 'btn';
    applyBtnElm.style.padding = '2px';
    applyBtnElm.innerText = "Apply";
    var resetBtnElm = document.createElement('button');
    resetBtnElm.addEventListener('click', resetDynamicParams);
    resetBtnElm.className = 'btn';
    resetBtnElm.style.padding = '2px';
    resetBtnElm.innerText = "Reset";
    resetBtnElm.style.marginLeft = '104px';
    element[0].style.overflow = 'auto';
    var brline = document.createElement('br');
    element.append(brline);
    element.append(applyBtnElm);
    element.append(resetBtnElm);
  }
}

function registerWidgetsToBeforeQueryListener() {
  for (var index = 0; index < prism.activeDashboard.widgets.length; index++) {
    var curWidToListen = prism.activeDashboard.widgets.$$widgets[index];
    if (curWidToListen.$$events.beforequery.handlers.length == 0 || curWidToListen.$$events.beforequery.handlers.includes(handleWidgetBeforeQuerty) == false) {
      curWidToListen.on("beforequery", handleWidgetBeforeQuerty);
    }
  }
}

function handleWidgetBeforeQuerty(widget, query) {
  if (dynamicParamsData.overrideValsConfig == null) {} else {
    for (var index = 0; index < query.query.metadata.length; index++) {
      var curJaql = query.query.metadata[index].jaql;
      if (curJaql.context != null) {
        if (dynamicParamsData.overrideValsConfig.hasOwnProperty(curJaql.formula)) {
          curJaql.formula = dynamicParamsData.overrideValsConfig[curJaql.formula];
        } else {
          for (var key in curJaql.context) {
            if (curJaql.context.hasOwnProperty(key)) {
              var currContext = curJaql.context[key];
              if (currContext.formula) {
                if (dynamicParamsData.overrideValsConfig.hasOwnProperty(currContext.formula)) {
                  curJaql.formula = curJaql.formula.replace(
                    key,
                    dynamicParamsData.overrideValsConfig[currContext.formula]
                  );
                }
              }
              if (dynamicParamsData.overrideValsConfig.hasOwnProperty(currContext.dim)) {
                curJaql.formula = curJaql.formula.replace(
                  key,
                  dynamicParamsData.overrideValsConfig[currContext.dim]
                );
              }
            }
          }
        }
      }
    }
  }
}

function applyDynamicParams(event) {
  dynamicParamsData.overrideValsConfig = {};
  for (var key in dynamicParamsData.dynamicParamsInputs) {
    if (dynamicParamsData.dynamicParamsInputs.hasOwnProperty(key)) {
      var curParamVal = dynamicParamsData.dynamicParamsInputs[key];
      dynamicParamsData.overrideValsConfig[key] = curParamVal.value;
    }
  }
  for (var index = 0; index < prism.activeDashboard.widgets.length; index++) {
    var curWidToListen = prism.activeDashboard.widgets.$$widgets[index];
    if (curWidToListen.type != 'DynamicParams') {
      curWidToListen.refresh();
    }
  }
}

function resetDynamicParams(event) {
  dynamicParamsData.overrideValsConfig = null;
  for (var index = 0; index < prism.activeDashboard.widgets.length; index++) {
    var curWidToListen = prism.activeDashboard.widgets.$$widgets[index];
    if (curWidToListen.type != 'DynamicParams') {
      curWidToListen.refresh();
    }
  }
}