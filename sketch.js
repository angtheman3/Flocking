const flock = [];

let alignSlider, cohesionSlider, separationSlider;

function setup() {
  createCanvas(600, 600);

  // Create sliders for adjusting the flocking behaviors
  alignSlider = createSlider(0, 2, 1.5, 0.1);
  cohesionSlider = createSlider(0, 2, 1, 0.1);
  separationSlider = createSlider(0, 2, 2, 0.1);

  // Position the sliders
  alignSlider.position(10, height + 10);
  cohesionSlider.position(10, height + 30);
  separationSlider.position(10, height + 50);

  // Create the flock of boids
  for (let i = 0; i < 300; i++) {
    flock.push(new Boid());
  }
}

function draw() {
  background(0);

  // Update and display each boid
  for (let boid of flock) {
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();
  }

  // Visualize velocities as colors
  let colors = [];
  colorMode(HSB, 255);
  for (let i = 0; i < flock.length; i += 3) {
    let r = map(flock[i].velocity.mag(), 0, 5, 0, 255);
    let g = map(flock[i + 1].velocity.mag(), 0, 5, 0, 255);
    let b = map(flock[i + 2].velocity.mag(), 0, 5, 0, 255);
    colors.push(color(r, g, b));
  }

  // Draw rectangles with the colors
  let w = width / colors.length;
  let h = 100;
  colors.sort((a, b) => hue(a) - hue(b));
  for (let i = 0; i < colors.length; i++) {
    let c = colors[i];
    fill(c);
    noStroke();
    rect(i * w, height - h, w, h);
  }
}

// Boid class definition
class Boid {
  constructor() {
    // Initialize position, velocity, and acceleration
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();

    // Maximum force and speed
    this.maxForce = 0.2;
    this.maxSpeed = 4;
  }

  edges() {
    // Wrap around the edges of the canvas
    if (this.position.x > width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = width;

    if (this.position.y > height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = height;
  }

  align(boids) {
    // Alignment behavior
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other !== this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;
  }

  cohesion(boids) {
    // Cohesion behavior
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other !== this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;
  }

  separation(boids) {
    // Separation behavior
    let perceptionRadius = 25;
    let steering = createVector();
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other !== this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d); // Weight by distance
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
    }

    if (steering.mag() > 0) {
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;
  }

  flock(boids) {
    // Calculate steering forces
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    // Apply slider values
    alignment.mult(alignSlider.value());
    cohesion.mult(cohesionSlider.value());
    separation.mult(separationSlider.value());

    // Accumulate acceleration
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    // Update velocity and position
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    // Reset acceleration
    this.acceleration.mult(0);
  }

  show() {
    // Draw the boid
    strokeWeight(8);
    stroke(255);
    point(this.position.x, this.position.y);
  }
}
