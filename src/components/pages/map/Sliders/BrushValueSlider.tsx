import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@store/index";
import { setBrushValue, LayerType } from "@store/brushSlice";
import { Slider } from "@components/widgets/Slider/Slider";

export function BrushValueSlider() {
  const dispatch = useDispatch();
  const { activeLayer, layerValues } = useSelector(
    (state: RootState) => state.brush,
  );

  const maxRange = activeLayer === LayerType.Elevation ? 400 : 100;
  const currentValue = layerValues[activeLayer];

  return (
    <Slider
      max={maxRange}
      currentValue={currentValue}
      onChange={(value) =>
        dispatch(
          setBrushValue({
            layer: activeLayer,
            value,
          }),
        )
      }
      label="Value"
    />
  );
}
