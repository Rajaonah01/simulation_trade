const calculateBtn = document.getElementById("calculateBtn");
const resultDiv = document.getElementById("result");
const calendarEl = document.getElementById("calendar");
const cycleChartEl = document.getElementById("cycleChart");

calculateBtn.addEventListener("click", () => {
    const lastPeriodInput = document.getElementById("lastPeriod").value;
    const cycleLength = Number(document.getElementById("cycleLength").value);

    if (!lastPeriodInput || !cycleLength) {
        resultDiv.innerHTML = '<p class="text-danger">Veuillez remplir tous les champs correctement.</p>';
        return;
    }

    const lastPeriod = new Date(lastPeriodInput);
    const periods = [];
    const fertilePeriods = [];

    // Calcul des 6 prochains cycles
    for (let i = 1; i <= 6; i++) {
        let nextPeriod = new Date(lastPeriod);
        nextPeriod.setDate(nextPeriod.getDate() + cycleLength * i);
        periods.push(nextPeriod);

        // Période fertile (10e au 16e jour du cycle)
        let fertileStart = new Date(nextPeriod);
        fertileStart.setDate(fertileStart.getDate() - cycleLength + 10);

        let fertileEnd = new Date(nextPeriod);
        fertileEnd.setDate(fertileEnd.getDate() - cycleLength + 16);

        fertilePeriods.push({ start: fertileStart, end: fertileEnd });
    }

    // Affichage texte
    let html = `<h4>Résultats :</h4>`;
    periods.forEach((p, i) => {
        html += `<p>Prochaine règle ${i + 1} : <strong>${p.toLocaleDateString()}</strong></p>`;
        html += `<p>Période fertile : <strong>${fertilePeriods[i].start.toLocaleDateString()} - ${fertilePeriods[i].end.toLocaleDateString()}</strong></p>`;
    });
    resultDiv.innerHTML = html;

    // Création des événements du calendrier
    const events = [];
    periods.forEach((p, i) => {
        events.push({
            title: `Règles ${i+1}`,
            start: p.toISOString().split('T')[0],
            allDay: true,
            color: '#ff4d6d'
        });
    });
    fertilePeriods.forEach((f, i) => {
        events.push({
            title: `Fertile ${i+1}`,
            start: f.start.toISOString().split('T')[0],
            end: f.end.toISOString().split('T')[0],
            allDay: true,
            color: '#ffcccb'
        });
    });

    calendarEl.innerHTML = "";
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 500,
        events: events
    });
    calendar.render();

    // Création du graphique Chart.js
    const labels = periods.map((p,i) => `Cycle ${i+1}`);
    const periodData = periods.map(() => 1);
    const fertileData = fertilePeriods.map(f => (f.end - f.start)/(1000*60*60*24) + 1); // jours fertiles

    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(cycleChartEl, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Règles (1 jour)',
                    data: periodData,
                    backgroundColor: '#ff4d6d'
                },
                {
                    label: 'Période fertile (jours)',
                    data: fertileData,
                    backgroundColor: '#ff99aa'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Visualisation des cycles et période fertile' }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Jours' } }
            }
        }
    });
});
