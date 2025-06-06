import { useCallback, useEffect, useState } from "react";
import Blockies from "react-blockies";
import { Address, isAddress } from "viem";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { InputBase } from "~~/components/scaffold-eth";

// ToDo:  move this function to an utility file
const isENS = (address = "") => address.endsWith(".eth") || address.endsWith(".xyz");

interface AddressInputProps<T = string> {
  value: T;
  onChange: (newValue: T) => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Address input with ENS name resolution
 */
export const AddressInput = ({ value, name, placeholder, disabled, onChange }: AddressInputProps<Address | string>) => {
  const { data: ensAddress, isLoading: isEnsAddressLoading } = useEnsAddress({
    name: value,
    enabled: isENS(value),
    chainId: 1,
    cacheTime: 30_000,
  });

  const [enteredEnsName, setEnteredEnsName] = useState<string>();
  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address: value,
    enabled: isAddress(value),
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName,
    enabled: Boolean(ensName),
    chainId: 1,
    cacheTime: 30_000,
  });

  // ens => address
  useEffect(() => {
    if (!ensAddress) return;

    // ENS resolved successfully
    setEnteredEnsName(value);
    onChange(ensAddress);
  }, [ensAddress, onChange, value]);

  useEffect(() => {
    setEnteredEnsName(undefined);
  }, [value]);

  const handleChange = useCallback(
    (newValue: Address) => {
      setEnteredEnsName(undefined);
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <InputBase<Address>
      name={name}
      placeholder={placeholder}
      error={ensAddress === null}
      value={value}
      onChange={handleChange}
      disabled={isEnsAddressLoading || isEnsNameLoading || disabled}
      className="disabled:rounded-full"
      prefix={
        ensName && (
          <div className="flex bg-base-300 rounded-l-full items-center">
            {ensAvatar ? (
              <span className="w-12">
                {
                  // eslint-disable-next-line
                  <img className="w-full rounded-full" src={ensAvatar} alt={`${ensAddress} avatar`} />
                }
              </span>
            ) : null}
            <span className="text-primary px-2">{enteredEnsName ?? ensName}</span>
          </div>
        )
      }
      suffix={
        value &&
        !ensAvatar && (
          <Blockies className="!rounded-full mt-[2px]" seed={value?.toLowerCase() as string} size={10} scale={5} />
        )
      }
    />
  );
};
