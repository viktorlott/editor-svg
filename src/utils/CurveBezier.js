class CurveBezier {

    constructor(startPoint, control1, control2, endPoint) {
        this.startPoint = startPoint;
        this.control1 = control1;
        this.control2 = control2;
        this.endPoint = endPoint;
    }

    static set(startPoint, control1, control2, endPoint) {
        return new CurveBezier(startPoint, control1, control2, endPoint)
    }

    length() {
        let steps = 10;
        let length = 0;
        let cx, cy, px = 0, py = 0, xDiff, yDiff;

        for (let i = 0; i <= steps; i++) {
            let t =  i / steps;
            cx = this.point(t, this.startPoint.x, this.control1.x,
                    this.control2.x, this.endPoint.x);
            cy = this.point(t, this.startPoint.y, this.control1.y,
                    this.control2.y, this.endPoint.y);
            if (i > 0) {
                xDiff = cx - px;
                yDiff = cy - py;
                length += Math.sqrt(xDiff * xDiff + yDiff * yDiff);
            }
            px = cx;
            py = cy;
        }
        return length;

    }

    point(t, start, c1, c2, end) {
        return start * (1.0 - t) * (1.0 - t) * (1.0 - t)
                + 3.0 * c1 * (1.0 - t) * (1.0 - t) * t
                + 3.0 * c2 * (1.0 - t) * t * t
                + end * t * t * t;
    }

}

class TimedPoint {
    set(x, y) {
        return new TimedPoint(x, y)
    }

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.timestamp = Date.now()
    }

    velocityFrom(start) {
        let velocity = this.distanceTo(start) / (this.timestamp - start.timestamp);
        if (velocity != velocity) return 0;
        return velocity;
    }

    distanceTo(point) {
        return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2))
    }
}


class ControlTimedPoints {
    set(c1, c2) {
        return new ControlTimedPoints(c1, c2)
    }

    constructor(c1, c2) {
        this.c1 = c1;
        this.c2 = c2;
    }

}