function main() {
    const app = new VisaNumbers();
    app.start();
}

class VisaNumbers {
    constructor() {
        this.timeout = 10 * 60 * 1000; // 10 minutes
        this.intervalHandle = null;
        this.caseNumbers = [];
        this.lastUpdateElement = document.getElementById('last-update');
        this.caseNumbersElement = document.getElementById('case-numbers');

        this.updateButton = document.getElementById('update');
        this.updateButton.addEventListener('click', this.update.bind(this));
    }

    start() {
        this.update();
        this.intervalHandle = setInterval(() => {
            this.update();
        }, this.timeout);
    }

    stop() {
        clearInterval(this.intervalHandle);
    }

    update() {
        this.updateButton.disabled = true;
        this.updateButton.innerText = 'Updating...';

        this.getCaseNumbers().then(readCaseNumbers => {
            if (readCaseNumbers && readCaseNumbers.length) {
                const date = new Date();
                this.lastUpdateElement.innerText = date.toLocaleString();

                const newCaseNumbers = readCaseNumbers.filter(
                    x => this.caseNumbers.indexOf(x) === -1
                );
                this.appendCaseNumbers(newCaseNumbers);

                this.caseNumbers = readCaseNumbers;
            }

            this.updateButton.disabled = false;
            this.updateButton.innerText = 'Update Now';
        });
    }

    getCaseNumbersTest() {
        const n = 10;
        const caseNumbers = [];
        for (let i = 0; i < n; i++) {
            caseNumbers.push(Math.round(Math.random() * 10));
        }

        return new Promise((resolve, reject) => resolve(caseNumbers));
    }

    getCaseNumbers() {
        return fetch(
            'https://am.usembassy.gov/visas/nonimmigrant-visas/non-immigrant-visa-application-numbers/?t=' +
                Math.random()
        )
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const tds = doc.querySelectorAll('table td:nth-child(1)');

                let caseNumbers = Array.from(tds).map(td => td.innerText);
                return caseNumbers.slice(1).reverse();
            })
            .catch(reason => {
                console.log(reason);
                return [];
            });
    }

    appendCaseNumbers(newCaseNumbers) {
        if (newCaseNumbers.length === 0) {
            return;
        }

        const div = document.createElement('div');

        const h3 = document.createElement('h3');
        const date = new Date();
        h3.innerText = date.toLocaleString();
        div.appendChild(h3);

        const hr = document.createElement('hr');
        div.appendChild(hr);

        const table = this.createTable(newCaseNumbers);
        div.appendChild(table);

        this.caseNumbersElement.prepend(div);
    }

    createTable(caseNumbers) {
        const table = document.createElement('table');
        caseNumbers.forEach((x, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i + 1}</td><td>${x}</td>`;
            table.appendChild(tr);
        });

        return table;
    }
}

main();
