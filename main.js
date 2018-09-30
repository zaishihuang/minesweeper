let cell_w = 16;
var ms = new MS(0, 0, 0);
var ClickFlag = {left: false, right: false};
var mTime = 0; // 记时
var mTimer; // 定时器
var GameState = 0; // -1 end  0 nor 1 start


Array.prototype.add = function(arr) {
    for (var i = 0; i < arr.length; i++) {
        this.push(arr[i]);
    }
    return this;
}

$(document).ready(function () {
    startGame();
});

function startGame() {
    GameState = 0;
    mTime = 0;
    stopTimer();
    ms.resetBoard(20,20,60);
    buildGameHeader();
    _setupUI();
    refreshUI();
}

function endGame() {
    $('#board_container').attr('disabled', 'true');
    
    GameState = -1;
    stopTimer();
    ms.revealAllMines();
    refreshUI();
}

function finshGame() {
    endGame();
}

function _setupUI() {
    // 禁止浏览器默认右键
    $('#board_container').bind("contextmenu", function () {return false;});
    $('#board_container').bind("selectstart",function(){return false;});  
    $('#board_container').removeAttr('disabled');
    $('#board_container').empty();
    $('#board_container').css({
        "width" : cell_w * ms.cols,
        "height" : cell_w * ms.rows,
    });
    for (var i = 0; i < ms.rows; i++) { // 行
        for (var j = 0; j < ms.cols; j++) { // 列
            var cellString = '<div class="cell" id="cell_' + i + '_' + j + '"></div>'
            $('#board_container').append(cellString);
            var cell = $('#cell_' + i + '_' + j);

            cell.mousedown(function (e) { 
                var id = e.target.id;
                if (id.startsWith('cell_')) {
                    if (e.which == 1) {
                        ClickFlag.left = true;
                    } else if(e.which == 3) {
                        ClickFlag.right = true;
                    }
                    if (ClickFlag.left && ClickFlag.right) {
                        var list = id.split('_')
                        var ti = parseInt(list[1]);
                        var tj = parseInt(list[2]);
                        previewAdjacentUnrevealedSquare(ti, tj)
                    }
                }
            });

            cell.mouseup(function (e) {
                var id = e.target.id;
                if (id.startsWith('cell_')) {
                    var list = id.split('_')
                    var ti = parseInt(list[1]);
                    var tj = parseInt(list[2]);
                    closePreviewAdjacentSquare(ti, tj);

                    if (e.which == 1) {
                        ClickFlag.left = false;
                        revealedAt(ti,tj);
                    } else if (e.which == 3) {
                        ClickFlag.right = false;
                        switchMarkMinesAt(ti,tj);
                    }
                }
            });

            var cellClass = getCellCssClass(i,j);
            cell.toggleClass(cellClass, true);
        }
    } 
}

function buildGameHeader() {
    var fml = (cell_w * ms.cols - (45 * 2) -26) / 2;
    $('#game_container').css({
        "width" : cell_w * ms.cols + 10 * 2,
        "height" : cell_w * ms.rows + 10 * 2 + 10 + 32,
    });

    $('#board_left').css({
        "width" : 10,
        "height" : cell_w * ms.rows,
    });

    $('#board_right').css({
        "width" : 10,
        "height" : cell_w * ms.rows,
    });

    $('#board_bottom').css({
        // "width" : cell_w * ms.cols,
        "height" : 10,
    });

    var header = $('#game_header');
    header.empty();

    var htmlArr = [];
    var tbArr_o = [];
    var tbArr = [];
    var tbArr_b = [];
    var lrArr = [];

    tbArr.push('<div class="border_tl"></div>');
    for (var i = 0; i < ms.cols; i++) {
        tbArr_o.push('<div class="border_tb"></div>');
        tbArr.push('<div class="border_tb"></div>');
    }
    tbArr.push('<div class="border_tr"></div>');

    for (var i = 0; i < ms.rows; i++) {
        lrArr.push('<div class="border_lr"></div>');
    }

    htmlArr.add(tbArr);
    htmlArr.push('<div class="border_lr_long"></div>');
    htmlArr.push('<div id="mines_count"> \
                    <div class="time1" id="mc1"></div> \
                    <div class="time2" id="mc2"></div> \
                    <div class="time3" id="mc3"></div> \
                  </div>');
    htmlArr.push('<div class="face_smile" style="margin-left:', Math.floor(fml), "px; margin-right: ", Math.ceil(fml), 'px;" id="header_face"></div>');
    htmlArr.push('<div id="time"> \
    <div class="time1" id="t1"></div> \
    <div class="time2" id="t2"></div> \
    <div class="time3" id="t3"></div> \
  </div>');
    htmlArr.push('<div class="border_lr_long"></div>');
    htmlArr.add(tbArr);   

    tbArr_b.push('<div class="border_bl"></div>');
    tbArr_b.add(tbArr_o);
    tbArr_b.push('<div class="border_br"></div>');

    header.html(htmlArr.join(""));
    $('#board_left').html(lrArr.join(""));
    $('#board_right').html(lrArr.join(""));
    $('#board_bottom').html(tbArr_b.join(""));

    $('#header_face').click(function (e) { 
        e.preventDefault();
        startGame();
    });
}

function refreshUI () {
    refreshUnrevealMines();
    refreshTimes();
    refreshBoardUI();
}

function refreshTimes() {
    var num = mTime;
    var one = num % 10;
    var ten = Math.floor(num/10) % 10;
    var hundreds = Math.floor(num/100) % 10;
    $('#t3').attr("class", "time"+one);
    $('#t2').attr("class", "time"+ten);
    $('#t1').attr("class", "time"+hundreds);
}

function refreshUnrevealMines() {
    var num = ms.getUnRevealMines();
    var one = num % 10;
    var ten = Math.floor(num/10) % 10;
    var hundreds = Math.floor(num/100) % 10;
    $('#mc3').attr("class", "time"+one);
    $('#mc2').attr("class", "time"+ten);
    $('#mc1').attr("class", "time"+hundreds);
}

function refreshBoardUI() {
    for (var i = 0; i < ms.rows; i++) { // 行
        for (var j = 0; j < ms.cols; j++) { // 列
            var cell = $('#cell_' + i + '_' + j);
            var cellClass = getCellCssClass(i,j);
            cell.attr('class', cellClass);
            // cell.toggleClass(cellClass, true);
        }
    }
}

function startTimer() {
    mTimer = setInterval(function(){
        mTime++;
        refreshTimes();
    }, 1000);
}

function stopTimer() {
    clearInterval(mTimer);
}

function revealedAt(x, y) {
    if (GameState != 1) {
        GameState = 1;
        startTimer();
    }
    ms.revealedAt(x, y);
    if (ms.isMinesAt(x, y)) {
        // 挖到雷了
        endGame();
    }

    if (ms.isRevealDone()) {
        finshGame();
    } else {
        refreshUI();
    }
}

function switchMarkMinesAt(x, y) {
    ms.switchMarkMinesAt(x, y);
    refreshUI();
}

function previewAdjacentUnrevealedSquare(x, y) {
    if (isNaN(ms.rendBoard[x][y])) return;
    var num = parseInt(ms.rendBoard[x][y]);
    if (num == 0) return;

    var arr = ms.getAdjacentUnRevealedSquares(x, y);
    var isMarkAll = ms.isMarkAllMinesAt(x, y);
    
    // 有标完雷 但是有标错
    if (isMarkAll) {
        var markErr = ms.isContainMinesInList(arr);
        if (markErr) {
            endGame();
            return;
        }
    }

    for (var i = 0; i < arr.length; i++) {
        var p = arr[i];
        var cell = $('#cell_' + p.x + '_' + p.y)
        if (isMarkAll) {
            // 自动revealed剩下的方块
            ms.revealedAt(p.x, p.y);
        } else {
            cell.toggleClass('cell_preview', true);
        }
    } 

    if (isMarkAll) {
        refreshUI();
    }
}

function closePreviewAdjacentSquare(x, y) {
    var rows = ms.rows;
    var cols = ms.cols;
    var tx, ty;
     for (var ti = -1; ti < 2; ti++) {
        tx = x+ti;
        if (tx < 0 || tx >= rows) continue;
        for (var tj = -1; tj < 2; tj++) {
            ty = y+tj
            if (ty < 0 || ty >= cols) continue;
            var cell = $('#cell_' + tx + '_' + ty)
            cell.toggleClass('cell_preview', false); 
        }
    }

}

function getCellCssClass(x, y) {
    var value = ms.rendBoard[x][y]

    var clsName = "cell"
    var revealClass = "";
    if (value == MS_E) {
        
    } else if (value == MS_M) {
        revealClass = "cell_m";
    } else if (value == MS_X) {
        revealClass = "cell_x";
    } else if (value == MS_P) {
        revealClass = "cell_p"
    } else {
        revealClass = "cell_d" + value;
    }
    if (revealClass.length) {
        clsName = clsName + " " + revealClass;
    }

    return clsName;
}