const field =
  document.getElementById("field");

const hero =
  document.querySelector(".hero");

const floralBg =
  document.getElementById("floral-bg");


// =========================
// DEVICE DETECTION
// =========================

const isTouchDevice =
  window.matchMedia("(pointer: coarse)").matches;


// =========================
// SETTINGS
// =========================

const POINT_COUNT =
  isTouchDevice ? 800 : 1000;

const REACTION_RADIUS =
  isTouchDevice ? 120 : 140;

const BASE_OPACITY = 0.003;

const MAX_OPACITY = 0.95;


/*
 * Fast activation
 * slower disappearance
 */

const ATTACK_SPEED = 0.6;

const DECAY_SPEED = 0.065;


/*
 * Ambient movement
 */

const DRIFT_SPEED =
  isTouchDevice ? 0.025 : 0.035;

const CURSOR_PUSH = 0.008;

const FRICTION = 0.94;

const RETURN_FORCE = 0.0012;


/*
 * Trail
 */

const TRAIL_LENGTH =
  isTouchDevice ? 10 : 14;

const TRAIL_SPACING = 5;

const TRAIL_DECAY = 0.78;


/*
 * Mobile autonomous movement
 */

const AUTO_SPEED = 0.003;

const AUTO_RADIUS_X = 0.28;

const AUTO_RADIUS_Y = 0.18;


/*
 * Green → yellow-green palette
 */

const COLORS = [
  "#63ff73",
  "#72ff67",
  "#84ff5c",
  "#98ff50",
  "#adff43",
  "#c2ff37",
  "#d8ff2c"
];


// =========================
// CREATE PARTICLES
// =========================

const particles = [];


for (
  let i = 0;
  i < POINT_COUNT;
  i++
) {

  const element =
    document.createElement("div");

  element.classList.add("point");


  const x =
    Math.random() *
    window.innerWidth;

  const y =
    Math.random() *
    window.innerHeight;


  const color =
    COLORS[
      Math.floor(
        Math.random() *
        COLORS.length
      )
    ];


  element.style.background =
    color;


  field.appendChild(element);


  particles.push({

    element,

    x,
    y,

    homeX: x,
    homeY: y,

    vx: 0,
    vy: 0,

    phase:
      Math.random() *
      Math.PI *
      2,

    driftX:
      Math.random() * 2 - 1,

    driftY:
      Math.random() * 2 - 1,

    color,

    opacity:
      BASE_OPACITY,

    targetOpacity:
      BASE_OPACITY,

    scale: 1,

    targetScale: 1

  });

}


// =========================
// INTERACTION POSITION
// =========================

let mouseX =
  window.innerWidth / 2;

let mouseY =
  window.innerHeight / 2;


let targetX = mouseX;

let targetY = mouseY;


let lastTrailX = mouseX;

let lastTrailY = mouseY;


let awake = false;

let touching = false;

let userHasInteracted = false;

let lastInteractionTime =
  performance.now();


const trail = [];


// =========================
// UPDATE INTERACTION
// =========================

function updateInteraction(
  x,
  y,
  addTrail = true
) {

  targetX = x;

  targetY = y;

  userHasInteracted = true;

  lastInteractionTime =
    performance.now();


  /*
   * Wake hero
   */

  if (!awake) {

    hero.style.opacity = 1;

    awake = true;

  }


  /*
   * Add trail
   */

  if (addTrail) {

    const dx =
      x - lastTrailX;

    const dy =
      y - lastTrailY;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance >
      TRAIL_SPACING
    ) {

      trail.unshift({

        x,
        y

      });


      if (
        trail.length >
        TRAIL_LENGTH
      ) {

        trail.pop();

      }


      lastTrailX = x;

      lastTrailY = y;

    }

  }

}


// =========================
// DESKTOP MOUSE
// =========================

window.addEventListener(
  "mousemove",
  event => {

    if (isTouchDevice) {
      return;
    }


    updateInteraction(
      event.clientX,
      event.clientY
    );

  }
);


// =========================
// MOBILE TOUCH
// =========================

window.addEventListener(
  "touchstart",
  event => {

    if (!isTouchDevice) {
      return;
    }


    touching = true;


    const touch =
      event.touches[0];


    if (!touch) {
      return;
    }


    updateInteraction(
      touch.clientX,
      touch.clientY
    );

  },
  {
    passive: true
  }
);


window.addEventListener(
  "touchmove",
  event => {

    if (!isTouchDevice) {
      return;
    }


    const touch =
      event.touches[0];


    if (!touch) {
      return;
    }


    updateInteraction(
      touch.clientX,
      touch.clientY
    );

  },
  {
    passive: true
  }
);


window.addEventListener(
  "touchend",
  () => {

    touching = false;

    lastInteractionTime =
      performance.now();

  },
  {
    passive: true
  }
);


// =========================
// ANIMATION
// =========================

let time = 0;


function animate() {

  time += 0.01;


  // =========================
  // MOBILE AUTONOMOUS PRESENCE
  // =========================

  if (
    isTouchDevice &&
    !touching
  ) {

    const idleTime =
      performance.now() -
      lastInteractionTime;


    /*
     * After finger leaves screen,
     * wait briefly before the
     * autonomous movement returns.
     */

    if (
      idleTime > 1200 ||
      !userHasInteracted
    ) {

      const centerX =
        window.innerWidth / 2;

      const centerY =
        window.innerHeight / 2;


      const radiusX =
        window.innerWidth *
        AUTO_RADIUS_X;

      const radiusY =
        window.innerHeight *
        AUTO_RADIUS_Y;


      /*
       * Organic figure-eight-ish
       * movement instead of a
       * perfect obvious circle.
       */

      targetX =
        centerX +
        Math.sin(
          time *
          AUTO_SPEED *
          100
        ) *
        radiusX;


      targetY =
        centerY +
        Math.sin(
          time *
          AUTO_SPEED *
          137
        ) *
        radiusY;

    }

  }


  // =========================
  // SMOOTH POSITION
  // =========================

  /*
   * Desktop stays extremely
   * responsive.
   *
   * Mobile autonomous movement
   * gets slight smoothing.
   */

  const followSpeed =
    touching
      ? 0.75
      : isTouchDevice
        ? 0.08
        : 0.85;


  mouseX +=
    (
      targetX -
      mouseX
    ) *
    followSpeed;


  mouseY +=
    (
      targetY -
      mouseY
    ) *
    followSpeed;


  // =========================
  // MOVE FLORAL REVEAL
  // =========================

  floralBg.style.setProperty(
    "--mouse-x",
    `${mouseX}px`
  );


  floralBg.style.setProperty(
    "--mouse-y",
    `${mouseY}px`
  );


  // =========================
  // MOBILE AUTO TRAIL
  // =========================

  if (
    isTouchDevice &&
    !touching
  ) {

    const dx =
      mouseX -
      lastTrailX;

    const dy =
      mouseY -
      lastTrailY;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance >
      TRAIL_SPACING
    ) {

      trail.unshift({

        x: mouseX,
        y: mouseY

      });


      if (
        trail.length >
        TRAIL_LENGTH
      ) {

        trail.pop();

      }


      lastTrailX =
        mouseX;

      lastTrailY =
        mouseY;

    }

  }


  // =========================
  // PARTICLES
  // =========================

  particles.forEach(
    particle => {


      // =========================
      // NATURAL DRIFT
      // =========================

      const waveX =
        Math.sin(
          time +
          particle.phase
        ) *
        DRIFT_SPEED;


      const waveY =
        Math.cos(
          time * 0.8 +
          particle.phase
        ) *
        DRIFT_SPEED;


      particle.vx +=
        waveX *
        particle.driftX;


      particle.vy +=
        waveY *
        particle.driftY;


      // =========================
      // CURRENT PRESENCE
      // =========================

      const cursorDX =
        particle.x -
        mouseX;


      const cursorDY =
        particle.y -
        mouseY;


      const cursorDistance =
        Math.sqrt(
          cursorDX *
          cursorDX +
          cursorDY *
          cursorDY
        );


      let cursorProximity =
        1 -
        cursorDistance /
        REACTION_RADIUS;


      cursorProximity =
        Math.max(
          0,
          Math.min(
            1,
            cursorProximity
          )
        );


      let intensity =
        Math.pow(
          cursorProximity,
          3
        );


      // =========================
      // TRAIL
      // =========================

      trail.forEach(
        (
          trailPoint,
          index
        ) => {


          const dx =
            particle.x -
            trailPoint.x;


          const dy =
            particle.y -
            trailPoint.y;


          const distance =
            Math.sqrt(
              dx * dx +
              dy * dy
            );


          let proximity =
            1 -
            distance /
            REACTION_RADIUS;


          proximity =
            Math.max(
              0,
              Math.min(
                1,
                proximity
              )
            );


          const ageStrength =
            Math.pow(
              TRAIL_DECAY,
              index
            );


          const trailIntensity =
            Math.pow(
              proximity,
              3
            ) *
            ageStrength;


          intensity =
            Math.max(
              intensity,
              trailIntensity
            );

        }
      );


      // =========================
      // PHYSICAL DISTURBANCE
      // =========================

      if (
        cursorDistance <
        REACTION_RADIUS &&
        cursorDistance > 0
      ) {

        const force =
          intensity *
          CURSOR_PUSH;


        particle.vx +=
          (
            cursorDX /
            cursorDistance
          ) *
          force;


        particle.vy +=
          (
            cursorDY /
            cursorDistance
          ) *
          force;

      }


      // =========================
      // RETURN HOME
      // =========================

      particle.vx +=
        (
          particle.homeX -
          particle.x
        ) *
        RETURN_FORCE;


      particle.vy +=
        (
          particle.homeY -
          particle.y
        ) *
        RETURN_FORCE;


      // =========================
      // FRICTION
      // =========================

      particle.vx *=
        FRICTION;

      particle.vy *=
        FRICTION;


      // =========================
      // POSITION
      // =========================

      particle.x +=
        particle.vx;

      particle.y +=
        particle.vy;


      // =========================
      // APPEARANCE
      // =========================

      particle.targetOpacity =
        BASE_OPACITY +
        intensity *
        (
          MAX_OPACITY -
          BASE_OPACITY
        );


      particle.targetScale =
        1 +
        intensity *
        1.8;


      const opacitySpeed =
        particle.targetOpacity >
        particle.opacity

          ? ATTACK_SPEED

          : DECAY_SPEED;


      const scaleSpeed =
        particle.targetScale >
        particle.scale

          ? ATTACK_SPEED

          : DECAY_SPEED;


      particle.opacity +=
        (
          particle.targetOpacity -
          particle.opacity
        ) *
        opacitySpeed;


      particle.scale +=
        (
          particle.targetScale -
          particle.scale
        ) *
        scaleSpeed;


      // =========================
      // GLOW
      // =========================

      const glow =
        4 +
        intensity *
        30;


      // =========================
      // DRAW
      // =========================

      particle.element.style.transform =
        `translate3d(
          ${particle.x}px,
          ${particle.y}px,
          0
        )
        scale(
          ${particle.scale}
        )`;


      particle.element.style.opacity =
        particle.opacity;


      particle.element.style.boxShadow =
        `0 0 ${glow}px ${particle.color}`;

    }
  );


  requestAnimationFrame(
    animate
  );

}


animate();


// =========================
// RESIZE
// =========================

window.addEventListener(
  "resize",
  () => {

    particles.forEach(
      particle => {

        particle.homeX =
          Math.random() *
          window.innerWidth;


        particle.homeY =
          Math.random() *
          window.innerHeight;

      }
    );

  }
);