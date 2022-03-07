class Plate {

  DEFAULT_OPTIONS = {
    numberOfRows: 8,
    numberOfColumns: 12,
    contentInformation: [],
    onClickCell: (cellElement, position) => { }
  };

  static Direction = {
    HORIZONTAL: 'H',
    VERTICAL: 'V'
  };

  #plateElement = {};

  /**
   * @param {string} htmlId selected table Id.
   * @param {number} numberOfRows number of rows in the plate
   * @param {number} numberOfColumns number of columns in the plate
   */
  constructor(htmlId, options = {}) {
    this.htmlId = htmlId;
    this.#plateElement = document.getElementById(htmlId);

    const currentOptions = { ...this.DEFAULT_OPTIONS, ...options };

    for (const [key, value] of Object.entries(currentOptions)) {
      this[key] = value ?? this.DEFAULT_OPTIONS[key];
    }

    return this;
  }

  /** Adds/Re-adds the table to the DOM */
  render = async () => {
    this.remove();
    this.#drawTable();
    await this.#drawContent();
    this.#addOnClickCell();
    this.#addResizeEventlistener();
    this.#displayCellContentOnHover();
    return this;
  };

  /** Completely removes the plate from the DOM. */
  remove = () => {
    this.#removeResizeEventlistener();
    this.#removeCellContentEventListeners();
    this.#plateElement.innerHTML = null;
    this.#plateElement.classList.remove('plate-overview');
    [...document.getElementsByClassName('cell-content-info')].forEach(b => b.remove());
    return this;
  };

  /** Adds an overlay that disables click events. */
  disable = () => {
    this.#plateElement.classList.add('plate-overlay');
    return this;
  };

  /** Removes the overlay that disables click events. */
  enable = () => {
    this.#plateElement.classList.remove('plate-overlay');
    return this;
  };

  /** Clears content/added classes, but keeps the table */
  clearContent = () => {
    this.#plateElement.querySelectorAll(`.plate-cell`)
      .forEach(el => el.className = 'plate-cell');
  };

  addClassToCells = (positions, cellClass) => {
    if (Array.isArray(positions)) {
      positions.forEach((position) => {
        this.#addClassToCell(position, cellClass);
      });
    }
  };

  forEachPosition = (callBack = (cellElement, position) => { }, direction = Plate.Direction.VERTICAL) => {
    switch (direction) {
      case Plate.Direction.VERTICAL:
        this.#iteratePositionsVertical(callBack);
        break;
      case Plate.Direction.HORIZONTAL:
        this.#iteratePositionsHorizontal(callBack);
        break;
      default:
    }
  };

  displayColorInfoLegend = (parentElementId = '', items = [{ class: '', text: '' }]) => {
    items.forEach(item => {
      const colorInfo = ` <div class="cell-info-color ${item.class} mx-2"></div>
                          <div class="cell-info-label me-3">${item.text}</div>`;

      document.getElementById(parentElementId).insertAdjacentHTML('beforeend', colorInfo);
    });
  };

  #addClassToCell = (position, cellClass) => {
    if (position) {
      const cell = this.#plateElement.querySelector(`[data-position=${position}]`);
      cell?.classList.add(cellClass);
    };

    return this;
  };

  #addOnClickCell = () => {
    const cells = [...this.#plateElement.querySelectorAll(`.plate-cell`)];
    cells.forEach(cell => {
      const position = cell.dataset.position;
      cell.addEventListener('click', () => {
        this.onClickCell(cell, position);
      });
    });
  };

  #iteratePositionsHorizontal = callback => {
    for (let rowNumber = 0; rowNumber < this.numberOfRows; rowNumber++) {
      let rowChar = String.fromCharCode('A'.charCodeAt(0) + rowNumber);
      for (let colNumber = 1; colNumber <= this.numberOfColumns; colNumber++) {
        let position = rowChar + colNumber;
        const cellElem = this.#plateElement.querySelector(`[data-position=${position}]`);
        callback(cellElem, position);
      }
    }
  };

  #iteratePositionsVertical = callback => {
    for (let colNumber = 1; colNumber < this.numberOfColumns + 1; colNumber++) {
      for (let rowNumber = 0; rowNumber <= this.numberOfRows - 1; rowNumber++) {
        let rowChar = String.fromCharCode('A'.charCodeAt(0) + rowNumber);
        let position = rowChar + colNumber;
        const cellElem = this.#plateElement.querySelector(`[data-position=${position}]`);
        callback(cellElem, position);
      }
    }
  };

  #displayCellContentOnHover = () => {
    this.#addCellContentEventListeners();
    return this;
  };

  #drawContent = () => {
    return new Promise(resolve => {
      this.clearContent();
      resolve();
    });
  };

  #createCellContentInfoBox = () => {
    const cellContentInfoBox = document.createElement('div');
    cellContentInfoBox.id = `${this.htmlId}-cell-content-info`;
    cellContentInfoBox.classList.add('cell-content-info');
    document.querySelector('body').insertAdjacentElement('afterbegin', cellContentInfoBox);
    return cellContentInfoBox;
  };

  #addCellContentEventListeners = () => {
    this.#removeCellContentEventListeners();
    const cells = [...this.#plateElement.querySelectorAll(`.plate-cell`)];
    cells.forEach(cell => {
      cell.addEventListener('mouseover', this.#displayCellContentInfoBox);
      cell.addEventListener('mouseleave', this.#hideCellContentInfoBox);
    });
  };

  #removeCellContentEventListeners = () => {
    const cells = [...this.#plateElement.querySelectorAll(`.plate-cell`)];
    cells.forEach(cell => {
      cell.removeEventListener('mouseover', this.#displayCellContentInfoBox);
      cell.removeEventListener('mouseleave', this.#hideCellContentInfoBox);
    });
  };

  #displayCellContentInfoBox = e => {
    const cellContentInfoBox = this.#createCellContentInfoBox();
    const cellRectangle = e.target.getBoundingClientRect();
    e.target.classList.add('cell-content');

    cellContentInfoBox.style.left = `${cellRectangle.right + window.pageXOffset}px`;
    cellContentInfoBox.style.top = `${cellRectangle.top + window.pageYOffset}px`;

    const cellContentInfoProps = this.#getCellContentInfo(e.target.dataset.position);

    if (!cellContentInfoProps) return;

    cellContentInfoBox.insertAdjacentHTML('afterbegin', cellContentInfoProps);

    this.#adjustToWindowBorders(cellContentInfoBox, cellRectangle);
    cellContentInfoBox.style.visibility = 'visible';
  };

  #adjustToWindowBorders = (cellContentInfoBox, cellRectangle) => {
    const arbitraryExtraAdjustment = 0.25;

    if (cellRectangle.top + cellContentInfoBox.clientHeight >= window.innerHeight) {
      cellContentInfoBox.style.top = `${cellRectangle.top + window.pageYOffset - cellContentInfoBox.clientHeight}px`;
    }

    if (cellRectangle.left + cellContentInfoBox.clientWidth >= window.innerWidth - cellContentInfoBox.clientWidth * arbitraryExtraAdjustment) {
      cellContentInfoBox.style.left = `${cellRectangle.left + window.pageXOffset - cellContentInfoBox.clientWidth}px`;
    }
  };

  #hideCellContentInfoBox = e => {
    const cellContentInfoBox = document.getElementById(`${this.htmlId}-cell-content-info`);
    e.target.classList.remove('cell-content');
    cellContentInfoBox.remove();
  };

  #getCellContentInfo = position => {
    let currentCell = this.contentInformation.find(cell => cell.position === position);

    if (!currentCell) {
      currentCell = this.contentInformation.find(cell => cell.Position === position);
    }

    if (!currentCell) return;

    let cellContentInfoProperties = '';

    for (const [key, value] of Object.entries(currentCell)) {

      const cellContentProperty = ` <p class="cell-content-info-property">
                                    <span class="cell-content-info-key">${key}:</span>
                                    <span class="cell-content-info-value">${value}</span>
                                    </p>`;

      cellContentInfoProperties += cellContentProperty;
    }
    return cellContentInfoProperties;
  };

  #setCellSize = () => {
    const allCells = this.#plateElement.querySelectorAll('.plate-row div');
    const plateWidth = this.#plateElement.clientWidth + window.pageXOffset;
    const divider = this.numberOfColumns + 1;
    const cellSize = plateWidth / divider + 'px';

    allCells.forEach(cell => {
      cell.style.width = cellSize;
      cell.style.height = cellSize;
    });
  };

  #drawTable = () => {
    this.#plateElement.classList.add('plate-overview');

    for (let row = 0; row <= this.numberOfRows; row++) {
      const plateRowElement = this.#createPlateRowElement();
      const rowCells = [];

      for (let col = 0; col <= this.numberOfColumns; col++) {
        const cell = this.#createCellElement(col, row);
        rowCells.push(cell);
      }

      rowCells.forEach(cell => plateRowElement.appendChild(cell));
      this.#plateElement.appendChild(plateRowElement);
    }

    this.#setCellSize();
  };

  #createPlateRowElement = () => {
    const plateRowElement = document.createElement('div');
    plateRowElement.classList.add('plate-row');
    return plateRowElement;
  };

  #createCellElement = (col, row) => {
    const cell = document.createElement('div');

    if (col === 0 && row > 0) {
      cell.classList.add('row-id-cell');
      cell.textContent = this.#getRowCharacterByRowNumber(row);
    }

    if (row === 0) {
      cell.classList.add('column-id-cell');

      if (col > 0) {
        cell.textContent = col;
      }
    }

    if (col > 0 && row > 0) {
      cell.classList.add('plate-cell');
      cell.dataset.position = this.#getRowCharacterByRowNumber(row) + col;
    }

    return cell;
  };

  #addResizeEventlistener = () => {
    this.#removeResizeEventlistener();
    window.addEventListener('resize', this.#setCellSize);
  };

  #removeResizeEventlistener = () => {
    window.removeEventListener('resize', this.#setCellSize);
  };

  #getRowCharacterByRowNumber = rowNumber => {
    return String.fromCharCode('A'.charCodeAt(0) + rowNumber - 1);
  };
}