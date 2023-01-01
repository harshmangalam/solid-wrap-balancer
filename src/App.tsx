import type { Component } from "solid-js";
import Balancer from "./solid-wrap-balancer";
const App: Component = () => {
  return (
    <div>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis deleniti
        necessitatibus reprehenderit voluptas, libero dolor illo laudantium
        facere tenetur amet quo sapiente voluptatem dolores, est in natus quia
        aliquid error!
      </p>

      <Balancer>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis
          deleniti necessitatibus reprehenderit voluptas, libero dolor illo
          laudantium facere tenetur amet quo sapiente voluptatem dolores, est in
          natus quia aliquid error!
        </p>
      </Balancer>
    </div>
  );
};

export default App;
