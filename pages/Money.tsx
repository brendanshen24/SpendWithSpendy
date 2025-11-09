import React, { useEffect, useRef, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import Matter from "matter-js";

export default function Money({
  balance,
  setBalance,
}: {
  balance: number;
  setBalance: (tab: number) => void;
}) {
  const { width, height } = Dimensions.get("window");
  const [bodies, setBodies] = useState<Matter.Body[]>([]);
  const engine = useRef(Matter.Engine.create()).current;
  const [tick, setTick] = useState(0);

  const removeBalance = (amount: number) => {
    setBalance(Math.max(0, balance - amount));
  };

  
  useEffect(() => {
    const world = engine.world;
    world.gravity.y = 1.0; // gravity

    // Clean world if balance changes
    Matter.World.clear(world, false);

    // --- STATIC BOUNDS ---
    const navBarHeight = 80;
    const groundY = height - navBarHeight;
    const wallThickness = 50;

    const ground = Matter.Bodies.rectangle(width / 2, groundY, width, 40, {
      isStatic: true,
    });
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      { isStatic: true }
    );
    const rightWall = Matter.Bodies.rectangle(
      width + wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      { isStatic: true }
    );

    // --- RANDOM BALLS ---
    const balls = Array.from({ length: Math.min(balance, 30) }).map((_, i) => {
      const randomX = Math.random() * (width - 50) + 25;
      const randomY = 50 + Math.random() * 100;
      const body = Matter.Bodies.circle(randomX, randomY, 25, {
        restitution: 1.2, // bounciness
        friction: 0.1,
        frictionAir: 0.02,
        density: 0.001,
      });

      // give each ball a slight random nudge so they don’t overlap
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      });

      return body;
    });

    // --- ADD EVERYTHING TO WORLD ---
    Matter.World.add(world, [ground, leftWall, rightWall, ...balls]);
    setBodies(balls);

    // --- RUN PHYSICS ---
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // --- UPDATE LOOP ---
    const interval = setInterval(() => setTick((t) => t + 1), 16);

    return () => {
      clearInterval(interval);
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [balance]);

  return (
    <View className="flex-1 bg-white">
      {/* Balance Display */}
      <View style={{ paddingVertical: 20 }}>
        <Text className="text-[86px] font-semibold text-center">
          ${balance}
        </Text>
      </View>

      {/* Physics Area */}
      <View style={{ flex: 1 }}>
        <Svg height={height} width={width}>
          {bodies.map((body, index) => (
            <Circle
              key={index}
              cx={body.position.x}
              cy={body.position.y}
              r={25}
              fill="green"
            />
          ))}

          {/* Navbar “ground” */}
          <Rect
            x={0}
            y={height - 80}
            width={width}
            height={80}
            fill="#f0f0f0"
            stroke="gray"
            strokeWidth={1}
          />
        </Svg>
      </View>
    </View>
  );
}
