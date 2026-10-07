// Timeline Rush: drag Bible events into the order they happened before the clock runs out.
// Level 1 has 5 events. Every level adds one more and draws them from a narrower stretch of the story.
(function () {
  const { h, shuffle, store } = BP;
  const START = 5;

  // Pick n events. Early levels spread across the whole Bible; later ones come from a narrower window.
  function draw(n, level) {
    const all = BIBLE_TIMELINE;
    const span = Math.max(n * 3, Math.round(all.length * Math.max(0.22, 1 - (level - 1) * 0.16)));
    const from = Math.floor(Math.random() * (all.length - span + 1));
    return BP.fresh('timeline', all.slice(from, from + span), n);
  }
  const seconds = (n) => 25 + n * 9;

  BP.games.timeline = {
    title: 'Timeline Rush',
    color: 'var(--c-timeline)',
    scoring: '100 points for every event in a level you clear, plus 5 for each second left.',
    badge() {
      const best = store.get('timeline-best', null);
      return best == null ? 'New' : `Best: level ${best}`;
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Timeline Rush', 'Put Bible events in the order they happened before the clock runs out.'), body);
      let stop = () => {};
      intro();

      function intro() {
        stop();
        body.replaceChildren(
          h('h2', { class: 'panel-title' }, 'How it works'),
          h('ul', { class: 'how-list' },
            h('li', null, 'You get five Bible events. Drag them so the earliest is at the top, or use the arrows.'),
            h('li', null, 'Press Lock it in before time runs out.'),
            h('li', { class: 'tl-kbd-hint' }, 'On a keyboard: ↑ ↓ to choose an event, Space to pick it up, ↑ ↓ to move it, Space to drop. Press C (or Enter) to lock it in.'),
            h('li', null, 'Get them all right and the next level adds one more event, from a closer stretch of the story.'),
            h('li', null, 'One mistake and the run is over.')),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: () => run() }, 'Start')));
      }

      function run() {
        let level = 1, points = 0, cleared = 0, boosted = false;
        const started = Date.now();
        playLevel();

        function playLevel() {
          stop();
          const n = START + level - 1;
          const events = draw(n, level);
          let left = seconds(n), done = false;
          const list = h('ol', { class: 'tl-list', 'aria-label': 'Events, earliest first' });
          const timer = h('span', { class: 'charade-timer tl-timer' }, left);
          const lock = h('button', { class: 'btn btn-primary', onclick: () => check(false) }, 'Lock it in');
          const out = h('div');
          // Extra Time power-up: +15 seconds, once per run.
          const extra = boosted ? null : BP.shop.chip('time', () => {
            if (done) return;
            boosted = true; left += 15;
            timer.textContent = left; timer.classList.toggle('low', left <= 10);
            say('Fifteen more seconds!');
          });
          const live = h('div', { class: 'tl-live', role: 'status', 'aria-live': 'polite' });
          let focusIdx = 0, lifted = false;
          const say = (msg) => { live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 30); };
          const pos = (i) => `position ${i + 1} of ${order.length}`;

          let order = events.slice();
          render();
          body.replaceChildren(
            h('div', { class: 'meta-row' },
              h('span', { class: 'pill pill-game' }, `Level ${level} · ${n} events`),
              h('span', null, `${points.toLocaleString('en-US')} pts`), timer, extra),
            h('p', { class: 'tl-end' }, '▲ Earliest'),
            list,
            h('p', { class: 'tl-end' }, '▼ Latest'),
            h('p', { class: 'tl-kbd-hint tl-kbd-line' }, '↑ ↓ choose · Space pick up / drop · C lock it in'),
            h('div', { class: 'btn-row' }, lock), out, live);

          // Keyboard play: arrows pick an event, Space/Enter lifts it, arrows carry it, Space/Enter drops it.
          const keys = (e) => {
            if (!document.body.contains(list)) return document.removeEventListener('keydown', keys);
            if (done || e.altKey || e.ctrlKey || e.metaKey) return;
            const t = e.target, inList = list.contains(t), onBtn = t && t.closest && t.closest('button, a, input, textarea, select');
            const k = e.key;
            if (k === 'ArrowUp' || k === 'ArrowDown') {
              if (onBtn && !inList) return;
              e.preventDefault();
              const step = k === 'ArrowUp' ? -1 : 1;
              if (!inList) return focusItem(focusIdx);
              if (lifted) {
                const to = focusIdx + step;
                if (to < 0 || to >= order.length) return say(`${order[focusIdx].event} is already ${step < 0 ? 'first' : 'last'}.`);
                move(focusIdx, to, true);
                say(`Moved to ${pos(to)}.`);
              } else focusItem(Math.max(0, Math.min(order.length - 1, focusIdx + step)));
            } else if (k === ' ' || k === 'Enter' || k === 'Spacebar') {
              if (onBtn && !(inList && !t.closest('.tl-arrows'))) return; // let real buttons click
              e.preventDefault();
              if (inList) toggleLift();
              else if (k === 'Enter') check(false);
              else focusItem(focusIdx);
            } else if (k === 'Escape' && lifted) {
              e.preventDefault(); toggleLift();
            } else if ((k === 'c' || k === 'C') && !(t && t.closest && t.closest('input, textarea'))) {
              e.preventDefault(); check(false);
            }
          };
          document.addEventListener('keydown', keys);

          function focusItem(i) {
            focusIdx = i;
            const li = list.children[i];
            if (li) { [...list.children].forEach((c, n) => c.setAttribute('tabindex', n === i ? '0' : '-1')); li.focus(); }
          }
          function toggleLift() {
            lifted = !lifted;
            render();
            focusItem(focusIdx);
            BP.sfx && BP.sfx('tap');
            const ev = order[focusIdx];
            say(lifted ? `Picked up ${ev.event}, ${pos(focusIdx)}. Use up and down arrows to move it, Space to drop.` : `Dropped ${ev.event} at ${pos(focusIdx)}.`);
          }

          const tick = setInterval(() => {
            if (!document.body.contains(timer)) return clearInterval(tick);
            left--; timer.textContent = left; timer.classList.toggle('low', left <= 10);
            if (left <= 0) check(true);
          }, 1000);
          stop = () => { clearInterval(tick); document.removeEventListener('keydown', keys); };

          function move(from, to, kbd) {
            if (done || to < 0 || to >= order.length || from === to) return;
            const [it] = order.splice(from, 1); order.splice(to, 0, it);
            if (focusIdx === from) focusIdx = to;
            render();
            if (kbd) return focusItem(to);
            const btn = list.children[to] && list.children[to].querySelector(from > to ? '.tl-up' : '.tl-down');
            if (btn && !btn.disabled) btn.focus({ preventScroll: true });
          }

          function render(marks) {
            list.replaceChildren(...order.map((ev, i) => {
              const up = !marks && lifted && i === focusIdx;
              const li = h('li', { class: 'tl-item' + (marks ? (marks[i] ? ' ok' : ' miss') : '') + (up ? ' tl-lifted' : ''),
                tabindex: marks ? null : (i === focusIdx ? '0' : '-1'), 'aria-grabbed': marks ? null : String(up),
                'aria-label': marks ? null : `${ev.event}, ${pos(i)}${up ? ', picked up' : ''}` },
                h('span', { class: 'tl-grip', 'aria-hidden': 'true' }, '⋮⋮'),
                h('span', { class: 'tl-text' }, ev.event, marks ? h('small', null, ev.ref) : ''),
                marks ? '' : h('span', { class: 'tl-arrows' },
                  h('button', { class: 'tl-up', type: 'button', 'aria-label': `Move “${ev.event}” earlier`, disabled: i === 0, onclick: () => move(i, i - 1) }, '▲'),
                  h('button', { class: 'tl-down', type: 'button', 'aria-label': `Move “${ev.event}” later`, disabled: i === order.length - 1, onclick: () => move(i, i + 1) }, '▼')));
              if (!marks) {
                li.addEventListener('pointerdown', (e) => startDrag(e, li));
                li.addEventListener('focus', () => { focusIdx = [...list.children].indexOf(li); });
              }
              return li;
            }));
          }

          // Drag to reorder: the item follows the pointer and swaps past its neighbours' midpoints.
          function startDrag(e, li) {
            if (done || e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
            e.preventDefault();
            lifted = false;
            let idx = [...list.children].indexOf(li);
            let baseY = e.clientY;
            li.classList.add('dragging');
            try { li.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events have no capture */ }
            const gap = () => parseFloat(getComputedStyle(list).rowGap) || 0;
            const onMove = (ev) => {
              li.style.transform = `translateY(${ev.clientY - baseY}px)`;
              const r = li.getBoundingClientRect(); const mid = r.top + r.height / 2;
              const prev = list.children[idx - 1], next = list.children[idx + 1];
              if (next && mid > next.getBoundingClientRect().top + next.offsetHeight / 2) {
                list.insertBefore(next, li); shift(idx + 1, next.offsetHeight + gap());
              } else if (prev && mid < prev.getBoundingClientRect().top + prev.offsetHeight / 2) {
                list.insertBefore(prev, li.nextSibling); shift(idx - 1, -(prev.offsetHeight + gap()));
              }
            };
            // Only the neighbour moves in the DOM (moving the dragged item would drop the pointer capture).
            // The dragged item's slot changed, so shift its anchor too and it stays under the pointer.
            function shift(to, px) {
              const [it] = order.splice(idx, 1); order.splice(to, 0, it);
              idx = to; baseY += px;
              li.style.transform = `translateY(${parseFloat(li.style.transform.slice(11)) - px}px)`;
            }
            const onUp = () => {
              li.removeEventListener('pointermove', onMove);
              li.removeEventListener('pointerup', onUp); li.removeEventListener('pointercancel', onUp);
              li.classList.remove('dragging'); li.style.transform = '';
              render();
            };
            li.addEventListener('pointermove', onMove);
            li.addEventListener('pointerup', onUp); li.addEventListener('pointercancel', onUp);
          }

          function check(timeUp) {
            if (done) return;
            done = true; stop(); lock.remove(); if (extra) extra.remove(); lifted = false;
            const sorted = order.slice().sort((a, b) => a.n - b.n);
            const marks = order.map((ev, i) => ev === sorted[i]);
            const right = marks.every(Boolean);
            render(marks);
            if (right) BP.sfx && BP.sfx('win'); else BP.sfx && BP.sfx('bad');
            say(right ? `All in order! Level ${level} cleared.` : (timeUp ? 'Time’s up. ' : 'Not quite. ') + 'The right order is shown below.');
            if (right) {
              const gained = n * 100 + Math.max(0, left) * 5;
              points += gained; cleared = level;
              out.replaceChildren(h('div', { class: 'feedback good' },
                h('strong', null, `${BP.cheer()} +${gained}`),
                h('p', null, `Level ${level} cleared with ${left} second${left === 1 ? '' : 's'} to spare. Next level adds another event.`)),
                h('div', { class: 'btn-row', style: 'margin-top:14px' },
                  h('button', { class: 'btn btn-primary', onclick: () => { level++; playLevel(); } }, `Level ${level + 1}`)));
              out.querySelector('button').focus({ preventScroll: true });
            } else {
              out.replaceChildren(h('div', { class: 'feedback bad' },
                h('strong', null, timeUp ? 'Time’s up!' : 'Not quite.'),
                h('p', null, 'Here’s the right order:'),
                h('ol', { class: 'tl-answer' }, sorted.map((ev) => h('li', null, ev.event, ' ', h('span', { class: 'ref' }, ev.ref))))),
                h('div', { class: 'btn-row', style: 'margin-top:14px' },
                  h('button', { class: 'btn btn-primary', onclick: finish }, 'See my score')));
            }
          }
        }

        function finish() {
          stop();
          const best = store.get('timeline-best', 0);
          if (cleared > best) store.set('timeline-best', cleared);
          if (cleared >= 3) BP.confetti();
          const take = TIMELINE_TAKEAWAYS[Math.floor(Math.random() * TIMELINE_TAKEAWAYS.length)];
          const msg = cleared >= 5 ? 'Bible historian!' : cleared >= 2 ? 'You know the story well.' : cleared === 1 ? 'Good start. Go again!' : 'No worries. The next run will go better.';
          const secs = Math.round((Date.now() - started) / 1000);
          body.replaceChildren(h('div', { class: 'result', style: 'display:grid;gap:14px' },
            h('p', { class: 'big-score' }, points.toLocaleString('en-US')),
            h('p', null, `points · ${cleared} level${cleared === 1 ? '' : 's'} cleared in ${secs} seconds`),
            h('h2', { class: 'panel-title' }, msg),
            h('div', { class: 'feedback good', style: 'text-align:left' },
              h('strong', null, 'The big story'),
              h('p', null, take.text), h('p', { class: 'ref' }, take.ref)),
            h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: run }, 'Play again')),
            BP.finish('timeline', { points, secs, detail: `Level ${cleared} cleared`, coins: cleared * 15 + 5, boosted })));
        }
      }
    },
  };
})();
