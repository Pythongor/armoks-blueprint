import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@store/store";
import { setBrushValue } from "@store/slices/paintSlice";
import { LayerType } from "#types";
import { Slider } from "@components/widgets/Slider/Slider";

export function BrushValueSlider() {
  const dispatch = useDispatch();
  const { activeLayer, layerValues } = useSelector(
    (state: RootState) => state.paint,
  );

  const minRange = activeLayer === LayerType.Temperature ? -50 : 0;
  const maxRange =
    activeLayer === LayerType.Elevation
      ? 400
      : activeLayer === LayerType.Temperature
        ? 120
        : 100;
  const currentValue = layerValues[activeLayer];

  return (
    <Slider
      min={minRange}
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
