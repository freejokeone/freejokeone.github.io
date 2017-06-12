
(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            docEl.style.fontSize = 32 * (clientWidth / 320) + 'px';
        };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);




window.alert = function(str)
{
    var strHtml;
    var shield = document.createElement("DIV");
    shield.id = "shield";
    shield.style.position = "fixed";
    shield.style.left = "0px";
    shield.style.top = "0px";
    shield.style.width = "100%";
    shield.style.height ="100%";
    shield.style.background = "rgba(0,0,0,0.3)";
    shield.style.zIndex = "999";
    var alertFram = document.createElement("DIV");
    alertFram.id="alertFram";
    alertFram.style.position = "fixed";
    alertFram.style.left = "50%";
    alertFram.style.top = "50%";
    alertFram.style.marginLeft = "-120px";
    alertFram.style.marginTop = "-75px";
    alertFram.style.width = "240px";
    alertFram.style.background = "#ffffff";
    alertFram.style.textAlign = "center";
    alertFram.style.zIndex = "999999";
    alertFram.style.borderRadius="20px";
    strHtml="<p style="\"border-radius:20px;margin:8px" 0;text-align:center;background:#fff;color:black;font-size:16px;\"="">"+str+"</p>"
    alertFram.innerHTML = strHtml;
    document.body.appendChild(alertFram);
    document.body.appendChild(shield);
    setTimeout(function(){
        doOk();
    },1600);
    this.doOk = function(){
        alertFram.style.display = "none";
        shield.style.display = "none";
    }
    alertFram.focus();
    document.body.onselectstart = function(){return false;};
};



window.mydialog=function(str,title){
    var strHtml;
    var titles=title||'提交成功';
    var shield = document.createElement("DIV");
    shield.id = "shield";
    shield.style.position = "fixed";
    shield.style.left = "0px";
    shield.style.top = "0px";
    shield.style.width = "100%";
    shield.style.height ="100%";
    shield.style.background = "rgba(0,0,0,0.3)";
    shield.style.zIndex = "999";
    var alertFram = document.createElement("DIV");
    alertFram.id="alertFram";
    alertFram.style.position = "fixed";
    alertFram.style.left = "50%";
    alertFram.style.top = "50%";
    alertFram.style.marginLeft = "-120px";
    alertFram.style.marginTop = "-75px";
    alertFram.style.width = "240px";
    alertFram.style.background = "#ffffff";
    alertFram.style.textAlign = "center";
    alertFram.style.zIndex = "999999";
    alertFram.style.borderRadius="5px";
    strHtml="<div style="text-align: center;border-bottom: 1px solid #dddddd;padding: 10px 0;">"+titles+"</div>";
    strHtml+="<p style="\"margin:20px" 0;text-align:center;background:#fff;color:black;font-size:16px;\"="">"+str+"</p>"
    strHtml+="<div id="close_dialog" style="color: #58cef9;border-top:1px solid #dddddd;padding: 10px 0;">确定</div>"
    alertFram.innerHTML = strHtml;
    document.body.appendChild(alertFram);
    document.body.appendChild(shield);
    this.removeElement=function(_element){
        var _parentElement = _element.parentNode;
        if(_parentElement){
            _parentElement.removeChild(_element);
        }
    }
    this.doOk = function(){
        alertFram.style.display = "none";
        removeElement(alertFram);
        shield.style.display = "none";
        removeElement(shield);
    };
    document.getElementById("close_dialog").onclick=function(){
        doOk();
    };
};