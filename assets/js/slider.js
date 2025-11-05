(function(){
function KodraSlider(root){
this.root=root;
this.track=root.querySelector('.kodra-track');
this.autoDelay=4500;
this.duration=900;
this.gap=getGap(this.track);
this.visible=5;
this.minCard=260;
this.isDown=false;
this.startX=0;
this.deltaX=0;
this.resumeTimeout=null;
this.wheelLock=false;
    this.centered=false;
    this.isTransitioning=false;
    this._onTransition=null;
    this._transitionTimer=null;
this.updateMeasurements(true);
this.bindNav();
this.attach();
this.bindDrag();
this.bindWheel();
this.startAuto();
window.addEventListener('resize',this.onResize.bind(this));
}
function getGap(el){
var cs=window.getComputedStyle(el);
var g=parseInt(cs.gap||cs.columnGap||'24',10);
return isNaN(g)?24:g;
}
KodraSlider.prototype.setPerView=function(){
var w=this.root.clientWidth;
var v=this.visible;
var g=this.gap;
while(v>1&&((w-g*(v-1))/v)<this.minCard){
v--;
}
var slideW=(w-g*(v-1))/v;
this.root.style.setProperty('--kodra-slide-w',slideW+'px');
this.perView=v;
};
KodraSlider.prototype.updateMeasurements=function(r){
if(r){
this.setPerView();
}
this.slides=Array.from(this.track.children);
this.slideWidth=this.slides[0]?this.slides[0].getBoundingClientRect().width:0;
this.step=this.slideWidth+this.gap;
this.updateCenteredState();
};
KodraSlider.prototype.updateCenteredState=function(){
var shouldCenter=this.slides.length<=this.perView;
this.centered=shouldCenter;
this.root.classList.toggle('is-center',shouldCenter);
if(shouldCenter){
this.stopAuto();
this.jumpToStart();
}else if(!this.timer&&!this.resumeTimeout){
this.startAuto();
}
};
KodraSlider.prototype.attach=function(){
this.track.style.transition='transform '+(this.duration/1000)+'s ease';
};
KodraSlider.prototype.onResize=function(){
this.gap=getGap(this.track);
this.setPerView();
this.updateMeasurements(false);
this.jumpToStart();
};
KodraSlider.prototype.jumpToStart=function(){
    if(this._onTransition){
        this.track.removeEventListener('transitionend',this._onTransition);
        this._onTransition=null;
    }
    if(this._transitionTimer){
        clearTimeout(this._transitionTimer);
        this._transitionTimer=null;
    }
    this.track.style.transition='none';
    this.track.style.transform='translateX(0px)';
    this.track.offsetHeight;
    this.attach();
    this.isTransitioning=false;
};
KodraSlider.prototype.next=function(){
    if(this.centered||this.isTransitioning){
        return;
    }
    var s=this;
    this.isTransitioning=true;
    if(this._onTransition){
        this.track.removeEventListener('transitionend',this._onTransition);
    }
    this._onTransition=function(){
        s.track.removeEventListener('transitionend',s._onTransition);
        s._onTransition=null;
        if(s._transitionTimer){
            clearTimeout(s._transitionTimer);
            s._transitionTimer=null;
        }
        s.track.style.transition='none';
        s.track.appendChild(s.track.firstElementChild);
        s.track.style.transform='translateX(0px)';
        s.track.offsetHeight;
        s.attach();
        s.updateMeasurements(false);
        s.isTransitioning=false;
    };
    this.track.addEventListener('transitionend',this._onTransition,{once:true});
    if(this._transitionTimer){
        clearTimeout(this._transitionTimer);
    }
    this._transitionTimer=setTimeout(function(){
        if(s._onTransition){
            s._onTransition();
        }
    },this.duration+120);
    this.track.style.transform='translateX('+(-this.step)+'px)';
    this.restartAutoAfterDelay();
};
KodraSlider.prototype.prev=function(){
    if(this.centered||this.isTransitioning){
        return;
    }
    var s=this;
    this.isTransitioning=true;
    if(this._onTransition){
        this.track.removeEventListener('transitionend',this._onTransition);
        this._onTransition=null;
    }
    this.track.style.transition='none';
    this.track.insertBefore(this.track.lastElementChild,this.track.firstElementChild);
    this.updateMeasurements(false);
    this.track.style.transform='translateX('+(-this.step)+'px)';
    this.track.offsetHeight;
    this.attach();
    this._onTransition=function(){
        s.track.removeEventListener('transitionend',s._onTransition);
        s._onTransition=null;
        if(s._transitionTimer){
            clearTimeout(s._transitionTimer);
            s._transitionTimer=null;
        }
        s.isTransitioning=false;
    };
    this.track.addEventListener('transitionend',this._onTransition,{once:true});
    if(this._transitionTimer){
        clearTimeout(this._transitionTimer);
    }
    this._transitionTimer=setTimeout(function(){
        if(s._onTransition){
            s._onTransition();
        }
    },this.duration+120);
    this.track.style.transform='translateX(0px)';
    this.restartAutoAfterDelay();
};
KodraSlider.prototype.startAuto=function(){
if(this.centered){
this.stopAuto();
return;
}
var s=this;
this.stopAuto();
this.timer=setInterval(function(){
s.next();
},this.autoDelay);
};
KodraSlider.prototype.stopAuto=function(){
if(this.timer){
clearInterval(this.timer);
this.timer=null;
}
if(this.resumeTimeout){
clearTimeout(this.resumeTimeout);
this.resumeTimeout=null;
}
};
KodraSlider.prototype.restartAutoAfterDelay=function(){
if(this.centered){
return;
}
var s=this;
this.stopAuto();
this.resumeTimeout=setTimeout(function(){
s.startAuto();
},this.autoDelay);
};
KodraSlider.prototype.bindNav=function(){
var w=this.root.parentElement;
var p=w.querySelector('.kodra-prev');
var n=w.querySelector('.kodra-next');
if(p){
p.addEventListener('click',this.prev.bind(this));
}
if(n){
n.addEventListener('click',this.next.bind(this));
}
};
KodraSlider.prototype.bindDrag=function(){
    var s=this;
    var el=this.track;
    var thr=50;
    el.addEventListener('pointerdown',function(e){
        if(s.centered||s.isTransitioning){
            return;
        }
        if(e.target.closest&&e.target.closest('a')){
            return;
        }
        s.isDown=true;
        s.startX=e.clientX;
        s.deltaX=0;
        s.stopAuto();
        el.style.transition='none';
el.setPointerCapture&&el.setPointerCapture(e.pointerId);
});
    el.addEventListener('pointermove',function(e){
        if(!s.isDown){
            return;
        }
        s.deltaX=e.clientX-s.startX;
        el.style.transform='translateX('+s.deltaX+'px)';
    });
function end(e){
if(!s.isDown){
return;
}
el.style.transition='transform '+(s.duration/1000)+'s ease';
if(s.deltaX<=-thr){
s.next();
}else if(s.deltaX>=thr){
s.prev();
}else{
s.jumpToStart();
s.restartAutoAfterDelay();
}
s.isDown=false;
s.deltaX=0;
el.releasePointerCapture&&el.releasePointerCapture(e.pointerId);
}
el.addEventListener('pointerup',end);
el.addEventListener('pointercancel',end);
el.addEventListener('pointerleave',function(e){
if(s.isDown){
end(e);
}
});
};
KodraSlider.prototype.bindWheel=function(){
    var s=this;
    this.root.addEventListener('wheel',function(e){
        if(s.centered||s.isTransitioning){
            return;
        }
        var ax=Math.abs(e.deltaX);
        var ay=Math.abs(e.deltaY);
        if(ax<1&&ay<1){
            return;
        }
        e.preventDefault();
        if(s.wheelLock){
            return;
        }
        s.wheelLock=true;
        var forward;
        if(ax>ay){
            forward=e.deltaX>0;
        }else{
            forward=e.deltaY>0;
        }
        if(forward){
            s.next();
        }else{
            s.prev();
        }
        clearTimeout(s.wheelUnlock);
        s.wheelUnlock=setTimeout(function(){
            s.wheelLock=false;
        },s.duration+100);
    },{passive:false});
};
document.addEventListener('DOMContentLoaded',function(){
document.querySelectorAll('.kodra-slider').forEach(function(sl){
new KodraSlider(sl);
});
});
})();
