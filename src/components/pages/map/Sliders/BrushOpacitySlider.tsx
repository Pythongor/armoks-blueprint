import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@store/index";
import { setBrushOpacity } from "@store/brushSlice";
import { Slider } from "@components/widgets/Slider/Slider";

export function BrushOpacitySlider() {
  const dispatch = useDispatch();
  const { brushOpacity } = useSelector((state: RootState) => state.brush);

  return (
    <Slider
      max={1}
      step={0.01}
      currentValue={brushOpacity}
      onChange={(value) => dispatch(setBrushOpacity(value))}
      label="Opacity"
    />
  );
}
