'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



class WorkOut {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    //  this.date = ...
    // this.id =...
    this.coords = coords; //[lat,lng]
    this.distance = distance; //in km
    this.duration = duration; // in min
  }
}

//!Running
class Running extends WorkOut {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

//!cycling
class Cycling extends WorkOut {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39,-12], 5.2 ,24 ,178);
// const cyc1 = new Cycling([39,-12], 5.2 ,24 ,178);
// console.log(run1,cyc1);
//////////////////////////////////////////////////////////////
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const clearInput = function () {
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
};
///!APPLICATION ARCHITECTRUE
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords; //line y
    const { longitude } = position.coords; //line x

    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);
    //   console.log(map);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Handing click on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    //display form
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
    clearInput();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allPostion = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    //clear input field
    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    //if workout running , create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check if data is
      //  if( !Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence) )
      if (
        !validInput(distance, duration, cadence) ||
        !allPostion(distance, duration, cadence)
      )
        return alert('Input have to be positive numbers!');
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    //if workout cycling, create cycling
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInput(distance, duration, elevation) ||
        !allPostion(distance, duration)
      )
        return alert('Input have to be positive numbers!');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    //add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);
    //Render workout on map as marker
    this.renderWorkMarker(workout);
    //Render workout on list

    //Clear input fields
    clearInput();
  }
  renderWorkMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 250,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('workout')
      .openPopup();
  }
}

const app = new App();
app._getPosition();
console.log(this);

