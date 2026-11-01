import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';

const target = document.getElementById('app');

if (!target) {
  throw new Error('Cannot find root #app element in DOM');
}

const app = mount(App, {
  target,
});

export default app;
