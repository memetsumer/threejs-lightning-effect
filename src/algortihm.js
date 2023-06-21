export default function aStar(start, end, nodes) {
    let openSet = [];
    let closedSet = [];
    openSet.push(start);

    while (openSet.length > 0) {
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            }
        }

        let current = openSet[lowestIndex];
        if (current === end) {
            let path = [];
            let temp = current;
            path.push(temp);
            while (temp.previous) {
                path.push(temp.previous);
                temp = temp.previous;
            }
            return path;
        }
        // Removes current element from openSet
        openSet = openSet.filter(node => node !== current);
        closedSet.push(current);
        let neighbors = current.neighbors;
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = nodes[neighbors[i]];

            if (!closedSet.includes(neighbor)) {
                let tempG = current.g + current.vertex.distanceTo(neighbor.vertex);

                let newPath = false;
                if (openSet.includes(neighbor)) {
                    if (tempG < neighbor.g) {
                        neighbor.g = tempG;
                        newPath = true;
                    }
                } else {
                    neighbor.g = tempG;
                    newPath = true;
                    openSet.push(neighbor);
                }

                if (newPath) {
                    neighbor.h = neighbor.vertex.distanceTo(end.vertex);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.previous = current;
                }
            }
        }
    }
    // No solution
    return [];
}
