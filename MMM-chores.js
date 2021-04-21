Date.prototype.getWeekNumber = function() {
    let d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
};

Module.register("MMM-chores", {
    defaults: {
        chores: [],
        id: "chore",
        showConfetti: true
    },

    start() {
        this.doUpdate()
    },

    doUpdate() {
        this.updateDom()
        setTimeout(() => {
            this.doUpdate()
        }, 5 * 60 * 1000)
    },

    getDom() {
        let str
        var today = new Date()

        var wrapper = document.createElement("div")
        this.config.chores.forEach((element, idx) => {
            if (!element.weekly) {
                str = "day-" + this.getDateString(today)
            } else {
                str = "week-" + this.getWeekString(today)
            }

            let elemId = element.id
            if (!elemId) {
                elemId = String(idx)
            }
            var id = this.config.id + "_" + elemId + "_" + str
            wrapper.appendChild(this.getCheckbox(element.label, id))
        });

        return wrapper
    },

    getDateString(date) {
        var td = String(date.getDate()).padStart(2, '0')
        var tm = String(date.getMonth() + 1).padStart(2, '0')
        var ty = date.getFullYear()

        return ty + tm + td
    },

    getWeekString(date) {
        return date.getFullYear() + String(date.getWeekNumber()).padStart(2, '0')
    },

    getCheckbox(label, id) {
        var container = document.createElement("label")
        container.className = "chores-container"
        container.innerText = label

        var cb = document.createElement("input")
        cb.type = "checkbox"
        if (id !== undefined) {
            cb.id = id
        }
        if (parseInt(localStorage.getItem(cb.id), 10)) {
            cb.checked = true
        }
        cb.onclick = (ev) => {
            localStorage.setItem(ev.target.id, cb.checked ? 1 : 0)
            if (this.config.showConfetti && cb.checked) {
                let loc = this.getElementPosition(cb)
                this.createConfetti(loc.x, loc.y, 20)
            }
        }

        var cm = document.createElement("span")
        cm.className = "checkmark"

        container.appendChild(cb)
        container.appendChild(cm)

        return container
    },

    getStyles() {
        return [this.file("MMM-chores.css")]
    },

    randomId(length) {
        var result = [];
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
        }
        return result.join('');
    },

    createConfetti(x, y, confettiItems) {
        let createElement = document.createElement('div');
        createElement.classList.add('MMM-chores', 'confetti');
        let makeId = this.randomId(10);
        createElement.setAttribute('data-mmm-chores-id', makeId);
        let confettiHTML = '';
        let colors = ['#2162ff', '#9e21ff', '#21a9ff', '#a9ff21', '#ff2184']

        for (var i = 0; i < confettiItems; ++i) {
            let color = Math.floor(Math.random() * (colors.length));
            confettiHTML += `<div class="confetti-item" style="background-color: ${colors[color]};" data-angle="${Math.random()}" data-speed="${Math.random()}"></div>`;
            confettiHTML += `<div class="confetti-item reverse" style="background-color: ${colors[color]};" data-angle="${Math.random()}" data-speed="${Math.random()}"></div>`;
        }

        createElement.style.position = `fixed`;
        createElement.style.top = `${y}px`;
        createElement.style.left = `${x}px`;
        createElement.innerHTML = confettiHTML;
        document.body.appendChild(createElement);

        let gravity = 50;
        let maxSpeed = 105000;
        let minSpeed = 65000;
        let t = 0;
        let maxAngle = 1500;
        let minAngle = 400;
        let opacity = 1;
        let rotateAngle = 0;

        let interval = setInterval(function() {
            document.querySelectorAll(`[data-mmm-chores-id="${makeId}"] .confetti-item`).forEach(function(item) {
                let modifierX = 1;
                let modifierY = 1;
                if (item.classList.contains('reverse')) {
                    modifierX = -1;
                }
                item.style.opacity = opacity;
                let randomNumber = parseFloat(item.getAttribute('data-angle'));
                let otherRandom = parseFloat(item.getAttribute('data-speed'));
                let newRotateAngle = randomNumber * rotateAngle;
                let angle = (randomNumber * (maxAngle - minAngle) + minAngle) / 1000;
                let speed = (randomNumber * (maxSpeed - minSpeed) + minSpeed) / 1000;
                let x = speed * t * Math.cos(angle) + (50 * otherRandom * t);
                let y = speed * t * Math.sin(angle) - (0.5 * gravity * Math.pow(t, 2)) + (50 * otherRandom * t);
                item.style.transform = `translateX(${x * modifierX}px) translateY(${y * -1 * modifierY}px) rotateY(${newRotateAngle}deg) scale(${1})`;
            })

            t += 0.1;
            rotateAngle += 3;
            opacity -= 0.02;
            if (t >= 6) {
                t = 0.1;
                if (document.querySelector(`[data-mmm-chores-id="${makeId}"]`) !== null) {
                    document.querySelector(`[data-mmm-chores-id="${makeId}"]`).remove();
                }
                clearInterval(interval);
            }
        }, 33.33);
    },

    getElementPosition(el) {
        var xPosition = 0;
        var yPosition = 0;

        while (el) {
            if (el.tagName.toLowerCase() === "BODY".toLowerCase()) {
                // deal with browser quirks with body/window/document and page scroll
                var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
                var yScrollPos = el.scrollTop || document.documentElement.scrollTop;

                xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
                yPosition += (el.offsetTop - yScrollPos + el.clientTop);
            } else {
                xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
            }

            el = el.offsetParent;
        }

        return {
            x: xPosition,
            y: yPosition
        };
    }
})