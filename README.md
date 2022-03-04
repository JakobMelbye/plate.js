# Plate.js

## Description
This library can be used to generate a visual representation of a plate. 
It is intented to make it easier to add css classes, click events and more for various use cases. 
All cells are identified by the data-position attribute on the HTML element e.g. "A1", "B1" etc., and contains the class 'plate-cell'.
<br> 

## HTML

To create the plate overview, insert a "div" HTML element where you want the plate overview to be generated, and select an id for the element:

```html 
<div id="my-plate"></div>
 ```
<br>

## CSS

The size of the plate is controlled by the css width property (it does not have to be inline) e.g.:
  
```html
<div id="my-plate" style="width: 50%"></div>
 ```
<br>

## JavaScript
To create the plate: Instantiate an object from the Plate class with the selected HTML element id, and an options object. If no options object is provided, the default options will be applied. 

### Plate instantiation
With options:
```javascript
const plate = new Plate('my-plate', options);
 ```
Without options:
```javascript
const plate = new Plate('my-plate');
 ```

## Options
The options object is used to configure the plate.
If no options object is provided, the default options will be used.
The provided properties will be applied to the default configuration object. If a property is not provided, the value from the default options will be used.

#### Default options

```javascript
const options = {
    numberOfRows: 8,
    numberOfColumns: 12,
    contentInformation: [],
    onClickCell: (cellElement, position) => {}
}
 ```

__numberOfRows:__ Sets the number of rows.

__numberOfColumns:__ Sets the number of columns.

__contentInformation:__ An array of objects containing information about each cell. This is the information that will displayed when hovering over a cell. The cell information is mapped by using the _position_ property in the object, so this propery is required. 

Example: _[{barcode: 'BAR111', matrixType: 'Plasma', position: 'A1'},{barcode: 'BAR222', matrixType: 'Serum', position: 'B1'}]_

__onClickCell__: Callback funtion that will be invoked when a cell is clicked. Receives cellElement and position as parameter.



## Functions

__render__: Adds/Re-adds the table to the DOM.

__remove__: Completely removes the plate from the DOM.

__disable__: Adds an overlay that disables click events.

__enable__: Removes the overlay that disables click events.

__clearContent__: Clears content/added classes, but keeps the table.

__addClassToCells__: Adds a single class to an array of cells. Example: _plate.addClassToCells(['G12', 'H12'], 'bg-blue')_.

__forEachPosition__: Runs a callback function for each cell/position on the plate. The callback function receives the cell html element and the position as parameters. The direction can be set by using the second parameter (default is vertical - can either be vertical or horizontal). 
Example: _plate.forEachPosition((cellElement, position) => {console.log(cellElement, position)})_.