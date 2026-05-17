import { Autocomplete, Avatar, Card, Flex, Spinner, Text } from "@sanity/ui";
import { useCallback, useEffect, useState } from "react";
import { ObjectInputProps, set, unset } from "sanity";

export type PokemonValue = {
  _type: "pokemon";
  name?: string;
  spriteUrl?: string;
};

export function PokemonInput(props: ObjectInputProps<PokemonValue>) {
  const { onChange, value } = props;
  const [pokemonList, setPokemonList] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1500")
      .then((res) => res.json())
      .then((data) => {
        setPokemonList(data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch pokemon list", err);
        setLoading(false);
      });
  }, []);

  const handleChange = useCallback(
    async (pokemonName: string) => {
      if (!pokemonName) {
        onChange(unset());
        return;
      }

      // Fetch the specific pokemon details to get the sprite
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const data = await res.json();

        onChange(
          set({
            _type: "pokemon",
            name: pokemonName,
            spriteUrl: data.sprites.front_default,
          })
        );
      } catch (err) {
        console.error("Failed to fetch pokemon details", err);
      }
    },
    [onChange]
  );

  return (
    <Card padding={0}>
      <Flex direction="column" gap={3}>
        <Autocomplete
          fontSize={2}
          icon={loading ? () => <Spinner /> : undefined}
          options={pokemonList.map((p) => ({ value: p.name }))}
          placeholder={loading ? "Loading Pokémon..." : "Search for a Pokémon..."}
          value={value?.name || ""}
          onChange={handleChange}
          disabled={loading}
        />
        {value?.name && value?.spriteUrl && (
          <Card padding={3} radius={2} tone="primary">
            <Flex align="center" gap={3}>
              <Avatar src={value.spriteUrl} size={2} alt={value.name} />
              <Text weight="semibold" style={{ textTransform: "capitalize" }}>
                {value.name}
              </Text>
            </Flex>
          </Card>
        )}
      </Flex>
    </Card>
  );
}
