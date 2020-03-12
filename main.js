(function () {
    const canvas = document.getElementById("canvas")
    const context = canvas.getContext("2d")

    const types = ["Mesh", "Line", "Circles", "Emojis"]

    const props = {
        friction: 0.98,
        attraction: -1,
        multiplier: 50,
        effect: 0.6,

        size: 20,
        lineWidth: 1,
        type: types[0],
        margin: 50,
        background: "#000000",
        foreground: "#ffffff",
        cursor: true,
        
        reset(){
            window.location.reload()
        },
    }

    const gui = new dat.GUI()
    const folder1 = gui.addFolder("Motion")
    folder1.open()
    folder1.add(props, 'friction', 0.9, 1).step(0.001).name("Friction")
    folder1.add(props, 'attraction', -5, -0.5).step(0.01).name("Attraction")
    folder1.add(props, 'multiplier', 1, 100).step(0.01).name("Wave Size")
    folder1.add(props, 'effect', 0.5, 1.5).step(0.01).name("Touch Effect")

    const folder2 = gui.addFolder("Appearance")
    folder2.open()
    folder2.add(props, 'type', types).name("Type")
    folder2.add(props, 'lineWidth', 1, 20).name("Stroke")
    folder2.add(props, 'size', 10, 50).step(5).name("Size")
        .onChange(value => {
            resizeHandler()
            generatePoints()
        }).onFinishChange(value => {
            resizeHandler()
            generatePoints()
        })
    folder2.add(props, 'margin', 0, 200).name("Margin")
        .onChange(value => {
            resizeHandler()
        }).onFinishChange(value => {
            resizeHandler()
        })
    
    folder2.addColor(props, 'background').name("Background")
    folder2.addColor(props, 'foreground').name("Foreground")

    folder2.add(props, 'cursor').name("Show Cursor")
        .onFinishChange(value => {
            document.body.setAttribute("class", value ? "" : "no-cursor")
        })
    
    gui.add(props, "reset").name("Reset")
    
    let emojiList = "👀🥰🤣😉😁😘🤣😍😁😛😏🤓😕😩🥵🥺🥶😟😭😣🥵🥱🙄😮🤔🤤😥"
    let emojis = []
    
    for(let i = 0; i < emojiList.length/2; i += 2) emojis.push(emojiList.slice(i, i+2))

    let points = []
    let touch = []

    let width = 0
    let height = 0

    let spacing = 10

    let minDim = 0

    function resizeHandler() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        minDim = Math.min(canvas.width, canvas.height) - props.margin
        spacing = (minDim) / props.size

        width = props.size
        height = props.size

        setPointsPosition()
    }

    function generatePoints() {
        points = []
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                points.push(new Point(0, 0))
            }
        }

        setPointsPosition()
    }

    function setPointsPosition() {
        let wx = canvas.width / 2 - ((width - 1) * spacing) / 2
        let wy = canvas.height / 2 - ((height - 1) * spacing) / 2

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let point = points[x + y * width]
                if (point) {
                    let px = x * spacing + wx
                    let py = y * spacing + wy

                    let ox = px - point.x
                    let oy = py - point.y

                    point.x += ox
                    point.y += oy

                    point.px += ox
                    point.py += oy
                }
            }
        }

    }

    resizeHandler()
    generatePoints()
    window.addEventListener("resize", resizeHandler, false)

    let mouse = {
        x: 0,
        y: 0,
    }

    function mouseHandler(e) {
        if (e.type === "mousedown") touch = [mouse]
        mouse.x = e.pageX
        mouse.y = e.pageY
        e.preventDefault()
    }

    function touchHandler(e) {
        touch = []
        for (let i = 0; i < e.touches.length; i++) {
            touch.push({
                x: e.touches[i].pageX,
                y: e.touches[i].pageY,
            })
        }
        e.preventDefault()
    }

    function touchEnd(e) {
        touch = []
        e.preventDefault()
    }
    
    window.addEventListener("scroll", e => e.preventDefault)
    
    canvas.addEventListener("mousedown", mouseHandler);
    canvas.addEventListener("mousemove", mouseHandler);
    canvas.addEventListener("mouseup", touchEnd);

    canvas.addEventListener("touchstart", touchHandler)
    canvas.addEventListener("touchmove", touchHandler)
    canvas.addEventListener("touchend", touchEnd)

    loop()

    function loop() {
        context.strokeStyle = props.foreground
        context.fillStyle = props.background
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < points.length; i++) points[i].update()
        
        for (let i = 0; i < points.length; i++) points[i].move()

        context.lineWidth = props.lineWidth;

        if (props.type === types[0]) {
            context.beginPath();
            for (let i = 0; i < points.length; i++) {
                let p = points[i]
                let action = "lineTo"

                if (i % width === 0) action = "moveTo"
                context[action](p.dx, p.dy)
            }

            for (let j = 0; j < width; j++) {
                for (let i = 0; i < height; i++) {
                    let p = points[j + i * width]
                    let action = "lineTo"

                    if (i === 0) action = "moveTo"
                    context[action](p.dx, p.dy)
                }
            }
            context.stroke()
        }
        
        if (props.type === types[1]) {
            context.beginPath();
            for (let i = 0; i < points.length; i++) {
                let p = points[i]

                context.moveTo(p.px, p.py)
                context.lineTo(p.dx, p.dy)
            }
            context.stroke()
        }
        
        if (props.type === types[2]) {
            context.beginPath();
            for (let i = 0; i < points.length; i++) {
                let p = points[i]
                let dx = p.dx - p.px
                let dy = p.dy - p.py
                let r = Math.sqrt(dx * dx + dy * dy)
                context.moveTo(p.dx + r, p.dy)
                context.arc(p.dx, p.dy, r, 0, Math.PI * 2)
            }
            context.stroke()
        }
        
        if (props.type === types[3]) {
            for (let i = 0; i < points.length; i++) {
                let p = points[i]
                let dx = p.dx - p.px
                let dy = p.dy - p.py
                let r = Math.sqrt(dx * dx + dy * dy)
                
                context.font = r + 'px serif'
                context.textAlign = "center"
                context.textBaseline = "middle"
                context.fillText(p.emoji, p.dx, p.dy)
            }
        }

        requestAnimationFrame(loop)
    }

    function Point(x, y) {
        this.vx = 0
        this.vy = 0

        this.x = this.px = x
        this.y = this.py = y

        this.dx = 0
        this.dy = 0
        
        this.emoji = emojis[Math.floor(Math.random() * emojis.length)]

        this.update = function () {
            for (let i = 0; i < points.length; i++) {
                let poin = points[i]

                if (poin != this) {
                    let dx = poin.px - poin.x
                    let dy = poin.py - poin.y

                    let dist2 = ((this.x - poin.px) * (this.x - poin.px) + (this.y - poin.py) * (this.y - poin.py))

                    if (dist2 != 0) {
                        this.vx += props.attraction * dx / dist2
                        this.vy += props.attraction * dy / dist2

                        poin.vx -= props.attraction * dx / dist2
                        poin.vy -= props.attraction * dy / dist2
                    }
                }
            }

            for (let t of touch) {
                let dx = this.x - t.x
                let dy = this.y - t.y

                let dist2 = (dx * dx + dy * dy);

                this.vx += props.effect * dx / dist2;
                this.vy += props.effect * dy / dist2;
            }

            this.vx += (this.px - this.x) / 200
            this.vy += (this.py - this.y) / 200;

            this.vx *= props.friction
            this.vy *= props.friction
        }

        this.move = function () {
            this.x += this.vx
            this.y += this.vy

            this.dx = this.px - (this.px - this.x) * props.multiplier
            this.dy = this.py - (this.py - this.y) * props.multiplier
        }
    }
})()
