import { Encode, encodeIntoArrayBuffer } from ".";

class Test {
  @Encode.int8
  value: number = 0;
  @Encode.uint24
  value24: number = 114514;
}

class Wrapper {
  @Encode.int8
  get simple() {
    return 5;
  }
  @Encode.typed(Test)
  value?: Test;
}

const value = new Test();
const wrapper = new Wrapper();
wrapper.value = value;
console.log(encodeIntoArrayBuffer(wrapper));
