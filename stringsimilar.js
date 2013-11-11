(function (exports) {

// Модуль реализует функцию нечеткого сравнения строк
// пример использования: document.write(stringSimilarWindow(s1,s2));
// в конце модуля есть несколько настроечных переменных
// сентябрь 2012
// imageman72@gmail.com
// imageman@druka.lv

var _stringSimilarWindow = function _stringSimilarWindow(S1, S2) {
// чем более похожи S1 и S2, тем ближе к 1. Разные строки =0
// приблизительная дистанция между двумя строками
// вычисляется методом плавающего окна
    console.log(S1, S2);
    var
        j, j1,
        i, lenSmall,
        BigTXT, SmallTXT,
        BadSum, GoodSumm,
        LenSubstrMin, LenSubstrMax, LenSubstrMax1,
        SubsString1,
        Result;
    var div = function (x, y) {
        return Math.round(x / y);
    };

    // начало вычислений

    if (S1.length > S2.length) {
        BigTXT = S1;
        SmallTXT = S2;
    } else {
        BigTXT = S2;
        SmallTXT = S1;
    }
    Result = 0;
    BadSum = 1;
    GoodSumm = 0;
    lenSmall = SmallTXT.length;
    LenSubstrMin = div(lenSmall, 20);
    if (LenSubstrMin < 3) {
        LenSubstrMin = 3;
    }
    if (LenSubstrMin > this._SmallestWordWindow) {
        LenSubstrMin = this._SmallestWordWindow;
    }
    LenSubstrMax = div(lenSmall, 2);
    if (LenSubstrMax > this._BiggestWordWindow) {
        LenSubstrMax = this._BiggestWordWindow;
    }

    for (i = 1; i <= lenSmall; i += this._Step) { // позиция подстроки
        LenSubstrMax1 = LenSubstrMax;
        if (LenSubstrMax + i > lenSmall) {
            LenSubstrMax1 = lenSmall - i;
        }
        for (j = LenSubstrMin; j <= LenSubstrMax1; j++) { // длина подстроки
            SubsString1 = SmallTXT.substr(i, j);
            if (BigTXT.indexOf(SubsString1) < 0) {
                for (j1 = j; j1 <= LenSubstrMax1; j1++) {
                    BadSum = BadSum + j1; // подсчитываем неудачные баллы
                }
                break;
            } else {
                GoodSumm = GoodSumm + j; // подсчитаем удачные баллы
            }
        }
    }
    Result = GoodSumm / (GoodSumm + BadSum) * (this._LenIgnoreKo + lenSmall) / (this._LenIgnoreKo + BigTXT.length);
    return Result;
};

var stringSimilarWindow =  function(){
    return _stringSimilarWindow.apply(stringSimilarWindow, arguments);
}
// переменная, которая отвечает за то, насколько подробно анализируются строки при нечетком сравнении (чем меньше, тем подробнее). Рекомендуемое значение = 4
stringSimilarWindow._SmallestWordWindow = 4;
stringSimilarWindow._BiggestWordWindow = 6;
stringSimilarWindow._Step = 2; // окно прыгает сразу на несколько позиций (ускорение счета)
stringSimilarWindow._LenIgnoreKo = 125; // насколько чувствительна должна быть разница между строками при сравнивании. Чем больше, тем меньше чувствительность

// При разных значениях _Step разное время вычислений. Не следует делать _Step слишком большим - страдает точность вычислений
//Result: 0.0866 time: 0.024 step=1
//Result: 0.0879 time: 0.013 step=2
//Result: 0.0906 time: 0.008 step=3
//Result: 0.0864 time: 0.006 step=4


var fastStringSimilar =  function(){
    return _stringSimilarWindow.apply(fastStringSimilar, arguments);
}
fastStringSimilar._SmallestWordWindow = 4;
fastStringSimilar._BiggestWordWindow = 4;
fastStringSimilar._Step = 3; // окно прыгает сразу на несколько позиций (ускорение счета)
fastStringSimilar._LenIgnoreKo = 125;

    exports.compare = stringSimilarWindow;
}(exports));