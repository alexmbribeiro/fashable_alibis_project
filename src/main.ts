import './style.css'
import { click } from './click.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Alibi</h1>
    <div class="card">
      <textarea id="inputBox" type="text" placeholder="Enter input here"/></textarea>
      <button id="actionButton" type="button">Submit</button>
      <textarea id="outputBox" class="output-box"></textarea>
    </div>
  </div>
`;

click()
