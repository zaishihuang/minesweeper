let MS_M = "M";  //  地雷
let MS_E = "E";  // 初始态 未挖掘
let MS_P = "P"; // 标记
let MS_X = "X";  // 挖到雷
let MS_Zero = "0";

function MS(rows, cols, mines) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.markMines = 0;
    this.board = [];
    this.rendBoard = [];
}

MS.prototype.buildBoard = function() {
    this.markMines = 0;
    this.board = genBoard(this.rows, this.cols, this.mines);
    this.rendBoard = genRenderBoard(this.rows, this.cols);
}

MS.prototype.resetBoard = function(rows, cols, mines) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.buildBoard();
}

MS.prototype.getUnRevealMines = function() {
    return this.mines - this.markMines;
}

MS.prototype.isUnRevealedAt = function(row, col) {
    return this.rendBoard[row][col] == MS_E;
}

MS.prototype.revealedAt = function(row, col) {
    revealed(this.board, this.rendBoard, row, col);
}

MS.prototype.switchMarkMinesAt = function(row, col) { 
    if (this.rendBoard[row][col] == MS_E) {
        this.rendBoard[row][col] = MS_P;
        this.markMines += 1;
    } else if (this.rendBoard[row][col] == MS_P) {
        this.rendBoard[row][col] = MS_E;
        this.markMines -= 1;
    }
 }

MS.prototype.isRevealDone = function() {
    if (this.getUnRevealMines() != 0) {
        return false;
    }

    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.cols; j++) {
            if (this.rendBoard[i][j] == MS_E) {
                return false;
            } 
        }
    }

    return true;
}

MS.prototype.isMinesAt = function(x, y) {
    return this.board[x][y] == MS_M;
}

MS.prototype.isMarkAllMinesAt = function(row, col) {
    if (isNaN(this.rendBoard[row][col])) return false;
    var arr = this.getAdjacentMarkSquares(row, col);
    var num = parseInt(this.rendBoard[row][col]);
    return num > 0 && arr.length == num;
}

MS.prototype.getAdjacentUnRevealedSquares = function(row, col) {
    return this.findAdjacentSquaresWithLabel(MS_E, row, col);
}
 
MS.prototype.getAdjacentMarkSquares = function(row, col) {
    return this.findAdjacentSquaresWithLabel(MS_P, row, col);
}

MS.prototype.findAdjacentSquaresWithLabel = function(label,row, col) {
    var rows = this.rows;
    var cols = this.cols;
    var arr = []; var tx, ty;
     for (var i = -1; i < 2; i++) {
        tx = row+i;
        if (tx < 0 || tx >= rows) continue;
        for (var j = -1; j < 2; j++) {
            ty = col+j
            if (ty < 0 || ty >= cols) continue;
            if (this.rendBoard[tx][ty] == label) { // 没被挖掘过
                arr.push({x:tx, y:ty});
            }
        }
    }
    return arr;
}

MS.prototype.isContainMinesInList = function(list) {
    for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (this.board[p.x][p.y] == MS_M) {
            return true;
        }
    } 

    return false;
}

MS.prototype.revealAllMines = function() {
    var rows = this.rows;
    var cols = this.cols;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (this.board[i][j] == MS_M) {
                var value = this.rendBoard[i][j];
                if (value == MS_E) {
                    this.rendBoard[i][j] = MS_M;
                }
            } 
        }
    }
}


///////////////
/////////////////
function genRenderBoard(rows, cols) {
    var rBoard = [];
    for (var i = 0; i < rows; i++) {
        rBoard[i] = []
        for (var j = 0; j < cols; j++) {
            rBoard[i][j] = MS_E;
        }
    }

    return rBoard;
}

// 每个格子两种状态 M(地雷)) 或者 digit(周边地雷数字)
function genBoard(rows, cols, mines) {
    var board = []
    for (var i = 0; i < rows; i++) { // 行
        board[i] = [];
        for (var j = 0; j < cols; j++) { // 列
            board[i][j] = '0';
        }
    }

    // init random maines
    for (var i = 0; i < mines; i++) {
        while (true) {
            var p = getRandomMinePoint(rows, cols);
            if (board[p.x][p.y] != MS_M) {
                board[p.x][p.y] = MS_M;
                break;
            }
        }
    }

    calculateMines(board);
    return board;
}

/**
探索地雷
1. 遍历找到地雷
2. 计算临近地雷的格子 的临近地雷数目
*/
function calculateMines(board) {
    if (board.length == 0) return board;
    var rows = board.length;
    var cols = board[0].length;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (board[i][j] != MS_M) {
                continue;
            }  
            
            // 计算地雷周边 块的地雷数
            var x, y;
            for (var ti = -1; ti < 2; ti++) {
                x = i+ti;
                if (x < 0 || x >= rows) continue;
                for (var tj = -1; tj < 2; tj++) {
                    y = j+tj
                    if (y < 0 || y >= cols) continue;
                    if (board[x][y] == MS_M) continue;
                    var num = parseInt(board[x][y]);
                    board[x][y] = (num+1)+'';
                }
            }
        }        
    }

    return board;
}

// 初始态都是E represents an unrevealed empty square
// 挖掘后 也是两种态 M 地雷，  digit 地雷数目 DFS
function revealed(board, renderBoard, x, y) {
    if (board.length == 0) return board;
    var rows = board.length;
    var cols = board[0].length;

    // 被挖掘过了
    if (renderBoard[x][y] != MS_E) return;

    renderBoard[x][y] = board[x][y];
    if (board[x][y] == MS_M) { // 挖到地雷m 停止
        renderBoard[x][y] = MS_X; 
        return;
    }

    // 该格子附近有地雷 停止
    if (board[x][y] != '0') {
        return
    } else {
        // 该格子临近无地雷 递归
        var tx, ty;
        for (var ti = -1; ti < 2; ti++) {
            tx = x+ti;
            if (tx < 0 || tx >= rows) continue;
            for (var tj = -1; tj < 2; tj++) {
                ty = y+tj
                if (ty < 0 || ty >= cols) continue;
                if (renderBoard[tx][ty] == MS_E) { // 没被挖掘过
                    revealed(board, renderBoard, tx, ty);
                }
            }
        }
    }
}

function getRandomMinePoint(tRows, tCols) {
    var p = {};
    p.x = randomNum(0, tRows);
    p.y = randomNum(0, tCols);
    return p
}

// 随机数生成器 整形 [min,max)
function randomNum(min, max) {
    var num = parseInt(Math.random()*(max-min)+min,10);
    return num;
}