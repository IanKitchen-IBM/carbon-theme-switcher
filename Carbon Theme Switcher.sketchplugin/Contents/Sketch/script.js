const sketch = require('sketch')
let document = sketch.getSelectedDocument()

const Library = require('sketch/dom').Library
let libraries = Library.getLibraries()

const SymbolMaster = require('sketch/dom').SymbolMaster
let symbols = document.getSymbols()

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
  let targetThemeReferences = findCarbonThemeReferences("Carbon Design System ("+target+" theme)")

  //if theme is available, update all symbols
  if(targetThemeReferences)
    updateThemes(document.selectedLayers.layers, targetThemeReferences)
  else
    sketch.UI.message("Could not find Carbon Design System ("+target+" theme) library")
}


//get the references for the target theme
function findCarbonThemeReferences(targetFullName){

  for(let i=0; i<libraries.length; i++){
    let library = libraries[i]

    if(library.name == targetFullName){
      return(library.getImportableSymbolReferencesForDocument(document))
    }
  }
}

//Actually do the updates
function updateThemes(layers, newTheme)
{
  let symbols = 0

  for(var i=0; i<layers.length; i++){
    let layer = layers[i]

    if (layer.type == 'SymbolInstance'){
      symbols = symbols + 1

      let newSymbolReference = findSymbolReferenceByName(layer.master.name,newTheme)

      if (newSymbolReference)
      {
        var newSymbolMaster = newSymbolReference.import()
        if (newSymbolMaster) {
          layer.master = newSymbolMaster
        }
      }
    }
  }

  if(symbols == 0){
    sketch.UI.message("No symbols were selected")
    return
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
