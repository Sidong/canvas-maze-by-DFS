$(document).ready(function() {
	// canvas;
	var canvas = $('#maze')[0];
	var ctx = canvas.getContext('2d');
	var W = canvas.width;
	var H = canvas.height;
	var cw = 15;
	var cellNum = W/cw;
	var totalCells = cellNum * cellNum;
	var isGenerated = false;
	// tmp variables;
	var i, j, x, y, new_x, new_y, rdNum, next_x, next_y, tmpCell;
	var maxCellNum = cellNum - 1;
	var neighbours;
	// x representx the line, y represents the column;
	var currentCell;
	var startCell = {x:0, y:0};
	var visitedCells;
	// interval;
	var generate_loop;

	// the maze data structure
	var maze;
	maze_g = maze;	// the global variable for testing;
	var cellStack = [];
	var popCellStack = [];
	var solutionStack = [];

	// define the maze cell class;
	var MazeCell = {
		createNew: function(x,y,border, wall, solution, backtrap){
			var mazeCell = {};
			// W S E N
			mazeCell.x = x || 0;
			mazeCell.y = y || 0;
			mazeCell.border = border || [0,0,0,0];
			mazeCell.wall = wall || [0,0,0,0];
			mazeCell.solution = solution || [0,0,0,0];
			mazeCell.backtrap = backtrap || [0,0,0,0];
			mazeCell.visited = false;
			return mazeCell;
		}
	};
	init();
	// create a 8*8 maze;
	function init() {
		visited = 1;
		visitedCells = 1;
		currentCell = {x:0, y:0};
		isGenerated = false;
		maze = [];
		cellStack = [];
		solutionStack = [];
		init_empty_maze();
		draw_walls();
		draw_position();
		maze[currentCell.x][currentCell.y].visited = true;
		// create_maze_DFS();
	}
	// init the maze array;
	function init_empty_maze() {
		// i represents the line, and j represents the column;
		for (i = 0; i < cellNum; i++)
		{
			var mazeLine = [];
			for (j = 0; j < cellNum; j++)
			{
				var border = [0,0,0,0];
				var wall = [1,1,1,1];
				var x = i;
				var y = j;
				if (i == 0) {
					border[3] = 1;
				} else if (i == 7) {
					border[1] = 1;
				}
				if (j == 0) {
					border[0] = 1;
				} else if (j == 7) {
					border[2] = 1;
				}
				var aCell = MazeCell.createNew(x,y,border,wall);
				mazeLine.push(aCell);
			}
			maze.push(mazeLine);
		}
	}
	// accord to the mazeCell.wall to draw the wall;
	function draw_walls() {
		// clear Rect;
		ctx.clearRect(0,0,W,H);
		// draw the walls;
		ctx.strokeStyle = "gray";
		ctx.lineWidth = 2;
		for (i = 0; i < cellNum; i++)
		{
			for (j = 0; j < cellNum; j++)
			{
				for (var k = 0; k < 4; k ++)
				{
					if (maze[i][j].wall[k])
					{
						switch(k)
						{
							case 0:
								x = j*cw, y = i*cw;
								new_x = x, new_y = y+cw;
								break;
							case 1:
								x = j*cw, y = i*cw + cw;
								new_x = x+cw, new_y = y;
								break;
							case 2:
								x = j*cw+cw, y = i*cw+cw;
								new_x = x, new_y = y-cw;
								break;
							case 3:
								x = j*cw+cw, y = i*cw;
								new_x = x-cw, new_y = y;
								break;
						}
						ctx.beginPath();
						ctx.moveTo(x, y);
						ctx.lineTo(new_x, new_y);
						ctx.stroke();
					}
				}
			}
		}
		// draw the borders;
		ctx.strokeStyle = "black";
		ctx.lineWidth = 5;
		ctx.strokeRect(0,0,W,H);
	}
	function draw_position(pos) {
		// draw the current position;
		var position = pos ? pos : currentCell;
		ctx.beginPath();
		ctx.fillStyle = 'lightgreen';
		// x represents the line, y represents the column;
		ctx.arc((position.y+0.5)*cw, (position.x+0.5)*cw, cw/3, 2*Math.PI, false);
		ctx.fill();
	}
	function create_maze_DFS() {
		if (visitedCells < totalCells)
		{
			// find the neighbours with unvisited state;
			find_neighbours(currentCell);
			// if find one or more;
			if (neighbours.length != 0)
			{
				// choose one at random;
				rdNum = Math.floor(Math.random()*neighbours.length);
				// break the wall between the current and the next position;
				next_x = neighbours[rdNum].x, next_y = neighbours[rdNum].y;
				if (currentCell.y > next_y) { // west side?
					maze[currentCell.x][currentCell.y].wall[0] = 0;
					maze[next_x][next_y].wall[2] = 0;
				} else if (currentCell.x < next_x) { // south side?
					maze[currentCell.x][currentCell.y].wall[1] = 0;
					maze[next_x][next_y].wall[3] = 0;
				} else if (currentCell.y < next_y) { // east side?
					maze[currentCell.x][currentCell.y].wall[2] = 0;
					maze[next_x][next_y].wall[0] = 0;
				} else if (currentCell.x > next_x) { // north side?
					maze[currentCell.x][currentCell.y].wall[3] = 0;
					maze[next_x][next_y].wall[1] = 0;
				}
				cellStack.push(maze[currentCell.x][currentCell.y]);
				currentCell.x = next_x, currentCell.y = next_y;
				maze[currentCell.x][currentCell.y].visited = true;
				// if find the out, keep the stack in the solutionStack;
				if (currentCell.x == maxCellNum && currentCell.y == maxCellNum) {
					solutionStack = cellStack.slice(0,cellStack.length);
					solutionStack.push(maze[currentCell.x][currentCell.y])
				}
				visitedCells++;
			} else {
				if (cellStack.length == 0) alert("error");
				tmpCell = cellStack.pop();
				popCellStack.push({x:currentCell.x, y:currentCell.y});
				currentCell.x = tmpCell.x, currentCell.y = tmpCell.y;
			}
		} else {
			isGenerated = true;
			clearInterval(generate_loop);
		}
		draw_walls();
		draw_position();
	}
	function find_neighbours(position) {
		neighbours = [];
		try {
			tmpCell = maze[position.x-1][position.y];
			if(tmpCell.visited == false && tmpCell.visited == false) {
				neighbours.push({x:position.x-1, y:position.y});
			}
		} catch (error){}
		try {
			tmpCell = maze[position.x+1][position.y];
			if(tmpCell.visited == false && tmpCell.visited == false) {
				neighbours.push({x:position.x+1, y:position.y});
			}
		} catch (error){}
		try {
			tmpCell = maze[position.x][position.y-1];
			if(tmpCell.visited == false && tmpCell.visited == false) {
				neighbours.push({x:position.x, y:position.y-1});
			}
		} catch (error){}
		try {
			tmpCell = maze[position.x][position.y+1];
			if(tmpCell.visited == false && tmpCell.visited == false) {
				neighbours.push({x:position.x, y:position.y+1});
			}
		} catch (error){}
	}
	function draw_path() {
		draw_walls();
		// draw the solution stack;
		var tmpCell;
		while (solutionStack.length > 0) {
			tmpCell = solutionStack.pop();
			draw_position({x:tmpCell.x, y:tmpCell.y});
		}
	}
	$(document).keydown(function(e) {
		if (e.which == 39) {
			generate_loop = setInterval(create_maze_DFS, 0.1);
			draw_position();
		} else if (e.which == 37) {
			if (generate_loop != undefined) clearInterval(generate_loop);
			init();
		} else if (e.which == 40) {
			if (isGenerated) {
				draw_path();
			}
		}
	});
});