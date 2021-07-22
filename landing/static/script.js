
// Creates a timer that doesn't tick while the screen is not visible.
// Returns an opaque value that can be passed to clearForegroundTimer.
function setForegroundTimeout(callback, duration) {
  if (duration == null) { duration = 0; }

  if (typeof(document.hidden) !== "boolean") { return setTimeout(callback, duration); }

  const TICK = 250;

  if (duration < TICK) { return setTimeout(callback, duration); }

  let elapsed = 0;
  const timer = setInterval(() => {
    if (document.hidden) { return; }

    elapsed += TICK;
    if (elapsed < duration) { return; }

    clearInterval(timer);
    callback();
  }, TICK);

  return { _fgTimer: true, timer };
}

function clearForegroundTimeout(id) {
  if (id && id._fgTimer === true) { return clearInterval(id); }
  return clearTimeout(id);
}

// Returns an array of random backers, weigted by total donations
const getBackers = (function() {

  // Load backer data
  const backers = Backers.split(",").map((backer) => {
    const comps = backer.split("=");
    return [ comps[0], parseInt(comps[1]) ];
  });
  const total = backers.reduce((accum, [ name, amount ]) => accum + amount, 0);

  return function (count) {

    // Asking for too many results
    if (count >= backers.length) { return backers.map(([ name, amount ]) => name); }

    // The total range to draw from
    let remaining = total;

    const result = [ ];
    for (let c = 0; c < count; c++) {

      // Random weighted index to pick
      let v = parseInt(Math.random() * remaining);

      // Find that backer
      for (let i = 0; i < backers.length; i++) {
        const [ name, amount ] = backers[i];
        if (v < amount) {
          result.push(name);
          backers.splice(i, 1);
          v = amount;
          break;
        }
        v -= amount;
      }

      // Adjust the randge to draw from
      remaining -= v;
    }

    return result;
  };
})();

// container: div.backers
// items: Array<{ name, image, url? }>
const runZipper = function(container, items, count) {
  if (count == null) { count = 6; }

  let nextId = 1;

  const template = document.getElementById("template-zipper-item");

  function add(item, animated) {
    const bucket = template.cloneNode(true);
    bucket.id = `zipper-item-${ nextId++ }`;

    let x = 0;
    if (container.children.length) {
      //console.log(container.lastChild, container.lastChild.style.transform);
      x = parseInt(container.lastChild.getAttribute("data-x")) + 100;
    }
    console.log(x);

    bucket.style.transform = `TranslateX(${ x }%)`;
    bucket.setAttribute("data-x", x);

    if (item.url) { bucket.setAttribute("href", item.url); }

    const image = bucket.querySelector(".image");
    image.style.background = `url(${ item.image }) center no-repeat`;
    image.style.backgroundSize = "contain";

    if (animated) {
      bucket.style.opacity = "0";
      bucket.style.transition = "opacity 0.2s linear 0.5s, transform 0.2s ease-out 0.5s";
    }

    bucket.querySelector(".title").textContent = item.name;

    container.appendChild(bucket);

    if (animated) {
      setTimeout(() => {
        Array.prototype.forEach.call(container.children, (child, index) => {
          const target = (index - 1) * 100;
          if (index === 0) {
            child.style.transition = "opacity 0.2s linear, transform 0.2s ease-in";
          } else if (child === bucket) {
            child.style.transition = "opacity 0.2s linear 0.5s, transform 0.2s ease-out 0.5s";
          } else {
            child.style.transition = "opacity 0.3s linear 0.1s, transform 0.5s linear 0.1s";
          }
          child.style.opacity = (index === 0) ? "0": "1";
          child.style.transform = `TranslateX(${ target }%)`;
          child.setAttribute("data-x", target);
        });
      }, 100);
    }

    return bucket;
  }

  let nextIndex = 0;
  let prefetchImage = null;
  function nextItem(prefetch) {
    const item = items[nextIndex];

    // Compute the next index
    nextIndex = (nextIndex + 1) % items.length;

    // Prefetch the next image
    if (prefetch) {
      const nextItem = items[nextIndex];
      prefetchImage = new Image();
      prefetchImage.src = nextItem.image;
      prefetchImage.onload = function(e) {
        //console.log(`Prefetched: ${ nextItem.name }`);
      };
    }

    return item;
  }

  for (let i = 0; i < count; i++) { add(nextItem(i === (count - 1)), false); }

  function runOnce() {
    // Remove the first backer
    const bucket = container.firstChild;
    setTimeout(() => { bucket.remove(); }, 2000);

    // Add the next backer
    const el = add(nextItem(true), true);
    setTimeout(() => {
      setForegroundTimeout(runOnce, 4000);
    }, 0);
  }
  setForegroundTimeout(runOnce, 4000);
}

runZipper(document.getElementById("backers"), getBackers(120).map((name) => ({
  name,
  image: `https:/\/gitcoin.co/dynamic/avatar/${ name }`,
  url: `https://gitcoin.co/${ name }`
})));

runZipper(document.getElementById("projects"), Projects);
