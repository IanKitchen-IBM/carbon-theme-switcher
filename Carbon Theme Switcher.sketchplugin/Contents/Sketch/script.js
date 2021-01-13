const sketch = require('sketch')
let document = sketch.getSelectedDocument()

const Library = require('sketch/dom').Library
let libraries = Library.getLibraries()

const SymbolMaster = require('sketch/dom').SymbolMaster
let symbols = document.getSymbols()

const SharedStyle = require('sketch/dom').SharedStyle

const Shape = require('sketch/dom').Shape

let symbolCount = 0;
let textCount = 0;
let layerCount = 0;

//Handlers
var changeToWhite = function(context){
  changeToTarget("White")
}

var changeToGray10 = function(context){
  changeToTarget("Gray 10")
}

var changeToGray90 = function(context){
  changeToTarget("Gray 90")
}

var changeToGray100 = function(context){
  changeToTarget("Gray 100")
}

function changeToTarget(target)
{
  let targetThemeName = "Carbon Design System ("+target+" theme)"
  
  let targetThemeReferences = findCarbonThemeReferences(targetThemeName)
  let targetTextStyleReferences = findCarbonTextStyleReferences(targetThemeName)
  let targetLayerStyleReferences = findCarbonLayerStyleReferences(targetThemeName)

  if(targetTextStyleReferences)
    console.log("found the text style references")

  //if theme is available, update all symbols
  if(targetThemeReferences)
    updateThemes(document.selectedLayers.layers, targetThemeReferences, targetTextStyleReferences, targetLayerStyleReferences)
  else
    sketch.UI.message("Could not find Carbon Design System ("+target+" theme) library")
}

//get the references for the target theme
function findCarbonThemeReferences(targetFullName)
{
  for(let i=0; i<libraries.length; i++){
    let library = libraries[i]

    if(library.name == targetFullName){
      return(library.getImportableSymbolReferencesForDocument(document))
    }
  }
}

function findCarbonTextStyleReferences(targetFullName)
{
  for(let i=0; i<libraries.length; i++){
    let library = libraries[i]

    if(library.name == targetFullName){
      console.log("found the reference")
      return(library.getImportableTextStyleReferencesForDocument(document))
    }
  } 
}

function findCarbonLayerStyleReferences(targetFullName)
{
  for(let i=0; i<libraries.length; i++){
    let library = libraries[i]

    if(library.name == targetFullName){
      console.log("found the reference")
      return(library.getImportableLayerStyleReferencesForDocument(document))
    }
  } 
}


//Actually do the updates
function updateThemes(layers, newTheme, newTextStyles, newLayerStyles)
{
  for(var i=0; i<layers.length; i++){
    let layer = layers[i]

    //console.log(layer.type)
    //console.log(layer.sharedStyle.getLibrary().name)

    if (layer.type == 'SymbolInstance')
    {
      let newSymbolReference = findSymbolReferenceByName(layer.master.name,newTheme)

      if (newSymbolReference)
      {
        var newSymbolMaster = newSymbolReference.import()
        if (newSymbolMaster) {
          layer.master = newSymbolMaster
          symbolCount = symbolCount + 1
        }
      }
    }
    else if(layer.type == 'Text')
    {
      let newTextStyle = findStyleByName(layer.sharedStyle.name, newTextStyles)

      if(newTextStyle)
      {
        var newTextStyleMaster = newTextStyle.import()
        if (newTextStyleMaster)
          layer.sharedStyle = newTextStyleMaster
          layer.style.syncWithSharedStyle(layer.sharedStyle)
          textCount = textCount + 1
      }
    }
    else if(layer.type == 'ShapePath')
    {
      let newLayerStyle = findStyleByName(layer.sharedStyle.name, newLayerStyles)

      if(newLayerStyle)
      {
        var newLayerStyleMaster = newLayerStyle.import()
        if (newLayerStyleMaster)
          layer.sharedStyle = newLayerStyleMaster
          layer.style.syncWithSharedStyle(layer.sharedStyle)
          layerCount = layerCount + 1
      }
    }
    else if(layer.type == 'Group'){
        updateThemes(layer.layers, newTheme, newTextStyles, newLayerStyles)
    }
  }

  if((symbolCount+textCount+layerCount) == 0){
    sketch.UI.message("No Carbon layers were selected")
  }
  else{
    sketch.UI.message(`Switched: symbols: ${symbolCount}, shapes: ${layerCount}, text: ${textCount}`)
  }
}

function findSymbolReferenceByName(name, newTheme){
  for(var i=0; i<newTheme.length; i++)
  {
    if(newTheme[i].name == name)
      return newTheme[i];
  }
  return null;
}

function findStyleByName(name, newStyles){
  for(var i=0; i<newStyles.length; i++)
  {
    if(newStyles[i].name == name)
      return newStyles[i];
  }
  return null;
}
