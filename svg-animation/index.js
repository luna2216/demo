const namespace = 'http://www.w3.org/2000/svg';

let count = 0;

function createSvg() {
  // create svg
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('width', '800px');
  svg.setAttribute('height', '600px');
  // add defs and g
  const defs = document.createElementNS(namespace, 'defs');
  const g = document.createElementNS(namespace, 'g');
  svg.appendChild(defs);
  svg.appendChild(g);
  // append to body
  document.body.appendChild(svg);
  return [svg, defs, g];
}

let [svg, defs, g] = createSvg();

function getId() {
  if (count === 1000) {
    count = 1;
    return [0, ...createSvg()];
  } else {
    return [count++, svg, defs, g];
  }
}

function addPath() {
  new Path(randomPos(), randomPos());
  requestAnimationFrame(addPath);
}

requestAnimationFrame(() => {
  addPath();
});

class Path {
  constructor(start, end) {
    const [id, svg, defs, g] = getId();
    const gradId = `linearGrad_${id}`;
    this.svg = svg;
    this.defs = defs;
    this.g = g;
    this.path = document.createElementNS(namespace, 'path');
    this.path.setAttribute('d', `M${start.join(' ')} L${end.join(' ')}`);
    this.path.setAttribute('stroke', `url('#${gradId}')`);

    this.mask = document.createElementNS(namespace, 'linearGradient');
    this.mask.setAttribute('id', gradId);
    let x1, x2, y1, y2;
    if (start[0] < end[0]) {
      x1 = '0%';
      x2 = '100%';
    } else {
      x1 = '100%';
      x2 = '0%';
    }
    if (start[1] < end[1]) {
      y1 = '0%';
      y2 = '100%';
    } else {
      y1 = '100%';
      y2 = '0%';
    }
    this.mask.setAttribute('x1', x1);
    this.mask.setAttribute('y1', y1);
    this.mask.setAttribute('x2', x2);
    this.mask.setAttribute('y2', y2);

    Array(5)
      .fill(0)
      .forEach((value, index) => {
        const stop = document.createElementNS(namespace, 'stop');
        stop.setAttribute('offset', '0');
        stop.setAttribute('stop-color', '#ffffff');
        stop.setAttribute('stop-opacity', index === 2 ? '1' : '0');

        if ([1, 2, 3].includes(index)) {
          const animate = document.createElementNS(namespace, 'animate');
          animate.setAttribute('attributeName', 'offset');
          if (index === 1) {
            animate.setAttribute('from', '-0.5');
            animate.setAttribute('to', '0.5');
          } else {
            animate.setAttribute('from', '0');
            animate.setAttribute('to', '1');
          }
          animate.setAttribute('dur', '2s');
          animate.setAttribute('fill', 'freeze');
          stop.appendChild(animate);
        }
        this.mask.appendChild(stop);
      });

    defs.appendChild(this.mask);
    g.appendChild(this.path);

    this.mask.querySelectorAll('animate').forEach(aniamte => aniamte.beginElement());
    setTimeout(() => {
      const animate = this.mask.querySelector('animate');
      const onEvent = () => {
        animate.removeEventListener('endEvent', onEvent);
        this.onDestroy();
      };
      animate.addEventListener('endEvent', onEvent);
    });
  }

  onDestroy() {
    if (this.path) {
      this.defs.removeChild(this.mask);
      this.g.removeChild(this.path);
      if (!this.g.hasChildNodes()) {
        document.body.removeChild(this.svg);
      }
      this.path = null;
      this.mask = null;
      this.defs = null;
      this.g = null;
      this.svg = null;
    }
  }
}

function randomPos() {
  return [Math.round(Math.random() * 800), Math.round(Math.random() * 600)];
}
