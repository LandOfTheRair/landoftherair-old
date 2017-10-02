
type Side = 'left' | 'right';

class FloatingBox {
  private el;

  constructor(private value: number, private side: Side, private color: string) {}

  init(element) {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.backgroundColor = '#aaa';
    el.style.padding = '3px';
    el.style.zIndex = '550';
    el.style.minHeight = '24px';
    el.style.bottom = '0';
    el.style[this.side] = '10px';
    el.style.color = this.color;
    el.style.fontWeight = 'bold';
    el.style.border = '1px solid #000';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 7s ease 0s';
    el.style.letterSpacing = '2px';
    el.innerText = `${this.value > 0 ? '+' : ''}${this.value.toLocaleString()}`;
    element.appendChild(el);

    this.el = el;
    this.windUp();
  }

  windUp() {

    const animation = this.el.animate([
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-548px)' }
    ], { duration: 7000 });

    animation.onfinish = () => this.el.parentNode.removeChild(this.el);
  }
}

export class XPBox extends FloatingBox {
  constructor(value: number) {
    super(value, 'left', value < 0 ? 'red' : 'green');
  }
}

export class HPBox extends FloatingBox {
  constructor(value: number) {
    super(value, 'right', value < 0 ? 'red' : 'blue');
  }
}
