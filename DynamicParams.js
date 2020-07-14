/**
 * Dynamic Params logical file
 * Developed By: Ben Richie Sadan @ Sisense
 * Version : 1.1.0
 * Last Modified Date : 13-July-2020
 */

let widgetName = 'DynamicParams';
let dynamicParamsData;

function initializeDynamicParams(widget, element){
  dynamicParamsData = {
    fieldsForDynamicParams:[],
    dynamicParamsInputs: [],
    numOfValues: 0
  };

  if (widget.metadata.panel("Fields").items.length > 0) {
    widget.metadata.panel("Fields").items.forEach(valueItem => {
      dynamicParamsData.fieldsForDynamicParams[valueItem.jaql.dim] = {
        title: valueItem.jaql.title,
        value: 1
      };

      dynamicParamsData.numOfValues++;
    });
  };

  registerWidgetsToBeforeQueryListener();

  if (dynamicParamsData.numOfValues > 0) {
    for (let key in dynamicParamsData.fieldsForDynamicParams) {
      if (dynamicParamsData.fieldsForDynamicParams.hasOwnProperty(key)) {
        let curParamVal = dynamicParamsData.fieldsForDynamicParams[key];

        let paramNameElm = document.createElement('h4');
        paramNameElm.innerHTML = curParamVal.title;

        let paramInputElm = document.createElement('input');
        paramInputElm.id = key + 'DynamicParamInput';
        paramInputElm.type = 'text';
        paramInputElm.value = curParamVal.value;

        dynamicParamsData.dynamicParamsInputs[key] = paramInputElm;

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
}

function registerWidgetsToBeforeQueryListener() {
  for (let index = 0; index < prism.activeDashboard.widgets.length; index++) {
    let curWidToListen = prism.activeDashboard.widgets.$$widgets[index];

    if (curWidToListen.$$events.beforequery.handlers.length == 0 || curWidToListen.$$events.beforequery.handlers.includes(handleWidgetBeforeQuerty) == false) {
      curWidToListen.on("beforequery", handleWidgetBeforeQuerty);
    }
  }
}

function handleWidgetBeforeQuerty(widget, query) {
  if (dynamicParamsData.overrideValsConfig == null) {

  } else {
    for (let index = 0; index < query.query.metadata.length; index++) {
      let curJaql = query.query.metadata[index].jaql;
      if (curJaql.context != null) {
        for (let key in curJaql.context) {
          if (curJaql.context.hasOwnProperty(key)) {
            let currContext = curJaql.context[key];

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

function applyDynamicParams(event) {
  dynamicParamsData.overrideValsConfig = {};

  for (let key in dynamicParamsData.dynamicParamsInputs) {
    if (dynamicParamsData.dynamicParamsInputs.hasOwnProperty(key)) {
      let curParamVal = dynamicParamsData.dynamicParamsInputs[key];

      dynamicParamsData.overrideValsConfig[key] = curParamVal.value;
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
  dynamicParamsData.overrideValsConfig = null;

  for (let index = 0; index < prism.activeDashboard.widgets.length; index++) {
    let curWidToListen = prism.activeDashboard.widgets.$$widgets[index];

    if (curWidToListen.type != widgetName) {
      curWidToListen.refresh();
    }
  }
}